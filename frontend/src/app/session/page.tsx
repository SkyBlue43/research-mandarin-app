"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import NextPhrase from "src/components/buttons/NextPhrase";
import PlayReferenceAudio from "src/components/buttons/PlayReferenceAudio";
import PlayUserAudio from "src/components/buttons/PlayUserAudio";
import Record from "src/components/buttons/Record";
import AlignedPitchChart from "src/components/charts/AlignedPitchCharts";
import PitchChart from "src/components/charts/PitchChart";
import CharacterDisplay from "src/components/header/CharacterDisplay";
import PinyinDisplay from "src/components/header/PinyinDisplay";
import Timer from "src/components/header/Timer";
import { useAudioRecorder } from "src/hooks/useAudioRecorder";
import { useAudioTranscriber } from "src/hooks/useAudioTranscriber";
import { useCharacters } from "src/hooks/useCharacters";
import { useDtw } from "src/hooks/useDtw";
import usePageState from "src/hooks/usePageState";
import { useReferenceAudio } from "src/hooks/useReferenceAudio";

export type PageState =
  | "none"
  | "playingUserAudio"
  | "playingReferenceAudio"
  | "moveOn";

export type GraphState = "none" | "user" | "reference" | "both";

export default function Session() {
  const searchParams = useSearchParams();
  const test = searchParams.get("test");
  const group = searchParams.get("group");
  const name = searchParams.get("name");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [pageState, setPageState] = useState<PageState>("none");
  const [graphState, setGraphState] = useState<GraphState>("none");

  const {
    characters,
    currentIndex,
    currentSimplified,
    currentTraditional,
    currentPinyin,
    currentHint,
    charError,
    charLoading,
  } = useCharacters(test, currentPhrase);

  const { referenceAudioPath, referencePitch } = useReferenceAudio(
    test!,
    currentIndex
  );

  const {
    startRecording,
    stopRecording,
    userAudioPath,
    recording,
    userBlob,
    userPitch,
  } = useAudioRecorder({
    setPageState: setPageState,
    setGraphState: setGraphState,
  });

  usePageState({
    pageState: pageState,
    setPageState: setPageState,
    setGraphState: setGraphState,
    userAudioPath: userAudioPath!,
    referenceAudioPath: referenceAudioPath,
  });

  const { transcribedWords } = useAudioTranscriber(
    userBlob!,
    referenceAudioPath,
    currentIndex
  );

  const { refWordsArray, alignedGraphData, accuracy, error } = useDtw(
    userPitch,
    referencePitch,
    test!,
    transcribedWords,
    currentIndex
  );

  const memoizedReferencePitch = useMemo(
    () => referencePitch,
    [referencePitch]
  );
  const memoizedUserPitch = useMemo(() => userPitch, [userPitch]);
  const memoizedAlignedPitch = useMemo(
    () => alignedGraphData,
    [alignedGraphData]
  );

  return (
    <div className="h-screen flex flex-col items-center text-center">
      <header className="m-8 w-screen">
        <Timer username={name} />
        <CharacterDisplay
          currentTraditional={currentTraditional}
          currentSimplified={currentSimplified}
        />
        <PinyinDisplay
          currentPinyin={currentPinyin}
          currentHint={currentHint}
        />
      </header>

      <div className="grid [grid-template-columns:1fr_4fr_1fr] w-screen h-100">
        <div>
          {pageState !== "none" && (
            <PlayUserAudio
              userPitchLength={userPitch.length}
              userAudioPath={userAudioPath!}
            />
          )}
          {pageState !== "none" && pageState != "playingReferenceAudio" && (
            <PlayReferenceAudio
              referencePitchLength={referencePitch.length}
              referenceAudioPath={referenceAudioPath}
            />
          )}
        </div>

        {group === "a" && graphState === "reference" && (
          <div className="flex items-center justify-center mr-4 ml-4 text-black">
            {referencePitch.length > 0 && (
              <PitchChart data={memoizedReferencePitch} color="#B0B0B0" />
            )}
          </div>
        )}

        {group === "a" && graphState === "user" && (
          <div className="flex flex-col items-center justify-center ml-4 mr-4 text-white">
            {userPitch.length > 0 && (
              <PitchChart data={memoizedUserPitch} color="#4682B4" />
            )}
          </div>
        )}

        {group === "a" && graphState === "both" && (
          <div className="flex flex-col items-center justify-center ml-4 mr-4 text-white">
            {alignedGraphData.length > 0 && (
              <>
                <AlignedPitchChart data={memoizedAlignedPitch} />
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "2rem",
                    marginTop: "1rem",
                  }}
                >
                  {refWordsArray.map((word, i) => {
                    const firstStart = refWordsArray[0].start;
                    const totalDuration =
                      refWordsArray[refWordsArray.length - 1].end - firstStart;
                    const chartLeftPadding = 8;
                    const chartRightPadding = 38;
                    const usableWidth =
                      140 - chartLeftPadding - chartRightPadding;

                    const left =
                      chartLeftPadding +
                      ((word.start - firstStart) / totalDuration) * usableWidth;
                    const width =
                      ((word.end - word.start) / totalDuration) * usableWidth;

                    return (
                      <span
                        key={i}
                        style={{
                          position: "absolute",
                          left: `${left}%`,
                          width: `${width}%`,
                          textAlign: "center",
                        }}
                      >
                        {word.char}
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* <Score accuracy={accuracy} /> */}
      </div>

      <footer className="grid grid-cols-3 w-screen p-8 pt-20">
        <div></div>
        <Record
          recording={recording}
          onStart={startRecording}
          onStop={stopRecording}
        />
        {pageState === "moveOn" && (
          <NextPhrase
            name={name!}
            test={test!}
            group={group!}
            setPageState={setPageState}
            setGraphState={setGraphState}
            currentPhrase={currentPhrase}
            characters={characters}
            setCurrentPhrase={setCurrentPhrase}
          />
        )}
      </footer>
    </div>
  );
}
