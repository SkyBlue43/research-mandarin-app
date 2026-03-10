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

export type PageState =
  | "none"
  | "playingUserAudio"
  | "playingReferenceAudio"
  | "moveOn";

export type GraphState = "none" | "user" | "reference" | "both";

function RedoContent() {
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
    clearGraphData,
  } = useDtw(userPitch, referencePitch, test!, transcribedWords, currentIndex);

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
  };

  useErrorAlerts({
    errorDTW,
    pageState,
    clearAllData,
  });

  return (
    <div className="app-shell min-h-screen flex flex-col items-center text-center relative">
      {pageState !== "none" &&
        pageState !== "playingReferenceAudio" &&
        pageState !== "playingUserAudio" &&
        alignedGraphData && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
            <Score accuracy={accuracy} />
          </div>
        )}

      <header className="w-full flex flex-col items-center gap-4 pt-3">
        <Timer userId={userId} test={test} />
        <CharacterDisplay
          currentTraditional={currentTraditional}
          currentSimplified={currentSimplified}
        />
        <PinyinDisplay
          currentPinyin={currentPinyin}
          currentHint={currentHint}
        />
      </header>

      <div className="w-full min-w-0 mt-3 grid grid-cols-1 lg:[grid-template-columns:220px_minmax(0,1fr)] gap-4 items-stretch">
        <div className="surface p-3 w-full min-w-0 flex flex-col items-center justify-evenly lg:min-h-[430px]">
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

        <div className="surface p-3 w-full min-w-0 flex items-center justify-center">
          <div className="w-full min-w-0">
            {group === "a" && graphState === "reference" && referencePitch.length > 0 && (
              <PitchChart data={memoizedReferencePitch} color="#B0B0B0" />
            )}

            {group === "a" && graphState === "user" && userPitch.length > 0 && (
              <PitchChart data={memoizedUserPitch} color="#4682B4" />
            )}

            {group === "a" && graphState === "both" && alignedGraphData.length > 0 && (
              <div className="w-full min-w-0">
                <AlignedPitchChart data={memoizedAlignedPitch} />
                <div className="relative w-full h-8 mt-3 overflow-hidden text-stone-700 text-sm">
                  {refWordsArray.length > 0 &&
                    refWordsArray.map((word, i) => {
                      const firstStart = refWordsArray[0].start;
                      const totalDuration =
                        refWordsArray[refWordsArray.length - 1].end - firstStart || 1;
                      const left = ((word.start - firstStart) / totalDuration) * 100;
                      const width = ((word.end - word.start) / totalDuration) * 100;

                      return (
                        <span
                          key={i}
                          style={{
                            position: "absolute",
                            left: `${left}%`,
                            width: `${width}%`,
                            textAlign: "center",
                            fontWeight: 700,
                          }}
                        >
                          {word.char}
                        </span>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="surface mt-4 w-full grid grid-cols-3 items-center p-4 md:p-5">
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
            sendBackToFinished={true}
          />
        )}
      </footer>
    </div>
  );
}

export default function Redo() {
  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <RedoContent />
    </Suspense>
  );
}
