"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import NextPhrase from "src/components/buttons/NextPhrase";
import PlayReferenceAudio from "src/components/buttons/PlayReferenceAudio";
import PlayUserAudio from "src/components/buttons/PlayUserAudio";
import ShowAlignedGraphs from "src/components/buttons/ShowAlignedGraph";
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
import { useErrorAlerts } from "src/hooks/useErrorAlerts";
import usePageState from "src/hooks/usePageState";
import { useReferenceAudio } from "src/hooks/useReferenceAudio";
import Score from "src/components/Score";
import { useAccuracy } from "src/hooks/useAccuracy";

export type PageState =
  | "none"
  | "playingUserAudio"
  | "playingReferenceAudio"
  | "moveOn";

export type GraphState = "none" | "user" | "reference" | "both";

function SessionContent() {
  const searchParams = useSearchParams();
  const test = searchParams.get("test");
  const group = searchParams.get("group");
  const userId = searchParams.get("userId");
  let currentPhraseIndex = Number(searchParams.get("currentPhrase")!);
  const [currentPhrase, setCurrentPhrase] = useState(currentPhraseIndex);
  const [pageState, setPageState] = useState<PageState>("none");
  const [graphState, setGraphState] = useState<GraphState>("none");

  const {
    characters,
    currentCurriculumId,
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
    currentCurriculumId
  );

  const {
    startRecording,
    stopRecording,
    userAudioPath,
    recording,
    userBlob,
    userPitch,
    setStartPageTransition,
    clearUserData,
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
    userBlob,
    referenceAudioPath,
    currentSimplified
  );

  const {
    refWordsArray,
    alignedGraphData,
    accuracy,
    errorDTW,
    setErrorDTW,
    clearGraphData,
  } = useDtw(
    userPitch,
    referencePitch,
    test!,
    transcribedWords,
    currentCurriculumId
  );

  useAccuracy(accuracy, test!, Number(userId), currentIndex);

  const memoizedReferencePitch = useMemo(
    () => referencePitch,
    [referencePitch]
  );
  const memoizedUserPitch = useMemo(() => userPitch, [userPitch]);
  const memoizedAlignedPitch = useMemo(
    () => alignedGraphData,
    [alignedGraphData]
  );

  const clearAllData = () => {
    clearUserData();
    clearGraphData();
    setGraphState("none");
    setPageState("none");
    setStartPageTransition(false);
    setErrorDTW(null);
  };

  useErrorAlerts({
    errorDTW,
    pageState,
    clearAllData,
  });

  return (
    <div className="h-screen flex flex-col items-center text-center">
      <header className="m-8 w-screen">
        <Timer
          userId={userId}
          test={test}
          redirectPath="/"
          advanceTestOnExpire={true}
        />
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
              setGraphState={setGraphState}
            />
          )}
          {pageState !== "none" && pageState !== "playingUserAudio" && (
            <PlayReferenceAudio
              referencePitchLength={referencePitch.length}
              referenceAudioPath={referenceAudioPath}
              setGraphState={setGraphState}
            />
          )}
          {pageState !== "none" &&
            pageState !== "playingReferenceAudio" &&
            pageState !== "playingUserAudio" && (
              <ShowAlignedGraphs setGraphState={setGraphState} />
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

        {pageState !== "none" &&
          pageState !== "playingReferenceAudio" &&
          pageState !== "playingUserAudio" &&
          alignedGraphData && <Score accuracy={accuracy} />}
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
            userId={userId!}
            test={test!}
            group={group!}
            currentPhrase={currentPhrase}
            characters={characters}
            setCurrentPhrase={setCurrentPhrase}
            clearAllData={clearAllData}
          />
        )}
      </footer>
    </div>
  );
}

export default function Session() {
  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <SessionContent />
    </Suspense>
  );
}
