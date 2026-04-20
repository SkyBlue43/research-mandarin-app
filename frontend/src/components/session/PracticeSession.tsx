"use client";

import { useEffect, useMemo, useState } from "react";
import NextPhrase from "src/components/buttons/NextPhrase";
import PlayReferenceAudio from "src/components/buttons/PlayReferenceAudio";
import PlayUserAudio from "src/components/buttons/PlayUserAudio";
import ShowAlignedGraphs from "src/components/buttons/ShowAlignedGraph";
import Record from "src/components/buttons/Record";
import AlignedPitchChart from "src/components/charts/AlignedPitchCharts";
import PitchChart from "src/components/charts/PitchChart";
import CharacterDisplay from "src/components/header/CharacterDisplay";
import PinyinDisplay from "src/components/header/PinyinDisplay";
import Score from "src/components/Score";
import { useAudioRecorder } from "src/hooks/useAudioRecorder";
import { useAudioTranscriber } from "src/hooks/useAudioTranscriber";
import { useCharacters } from "src/hooks/useCharacters";
import { useDtw } from "src/hooks/useDtw";
import { useErrorAlerts } from "src/hooks/useErrorAlerts";
import usePageState from "src/hooks/usePageState";
import { useReferenceAudio } from "src/hooks/useReferenceAudio";

import { GraphState, PageState } from "./sessionTypes";

type PracticeSessionProps = {
  lessonId: string;
  initialPhrase: number;
  showScore?: boolean;
  showPlaybackControls?: boolean;
  showCharts?: boolean;
  autoPlayReview?: boolean;
  completionPath?: string;
};

export default function PracticeSession({
  lessonId,
  initialPhrase,
  showScore = true,
  showPlaybackControls = true,
  showCharts = true,
  autoPlayReview = true,
  completionPath = "/finished",
}: PracticeSessionProps) {
  const scoreStorageKey = `lessonScores:${lessonId}`;
  const defaultGraphState: GraphState = showCharts ? "reference" : "none";
  const [currentPhrase, setCurrentPhrase] = useState(initialPhrase);
  const [pageState, setPageState] = useState<PageState>("none");
  const [graphState, setGraphState] = useState<GraphState>(defaultGraphState);
  const [lessonScores, setLessonScores] = useState<number[]>([]);

  const {
    characters,
    currentCurriculumId,
    currentIndex,
    currentSimplified,
    currentTraditional,
    currentPinyin,
    currentHint,
  } = useCharacters(lessonId, currentPhrase);

  const { referenceAudioPath, referencePitch } = useReferenceAudio(
    lessonId,
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
    setPageState,
    setGraphState,
    autoPlayReview,
  });

  usePageState({
    pageState,
    setPageState,
    setGraphState,
    userAudioPath: userAudioPath ?? "",
    referenceAudioPath,
    enabled: autoPlayReview,
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
    lessonId,
    transcribedWords,
    currentCurriculumId
  );

  const memoizedReferencePitch = useMemo(() => referencePitch, [referencePitch]);
  const memoizedUserPitch = useMemo(() => userPitch, [userPitch]);
  const memoizedAlignedPitch = useMemo(
    () => alignedGraphData,
    [alignedGraphData]
  );

  useEffect(() => {
    if (characters.length === 0) {
      return;
    }

    setLessonScores((previousScores) => {
      const nextScores =
        previousScores.length === characters.length
          ? previousScores
          : Array.from({ length: characters.length }, (_, index) => previousScores[index] ?? 0);

      sessionStorage.setItem(scoreStorageKey, JSON.stringify(nextScores));
      return nextScores;
    });
  }, [characters, scoreStorageKey]);

  useEffect(() => {
    if (accuracy <= 0 || alignedGraphData.length === 0 || characters.length === 0) {
      return;
    }

    setLessonScores((previousScores) => {
      const nextScores = Array.from(
        { length: Math.max(previousScores.length, characters.length) },
        (_, index) => previousScores[index] ?? 0
      );
      nextScores[currentPhrase] = accuracy;
      sessionStorage.setItem(scoreStorageKey, JSON.stringify(nextScores));
      return nextScores;
    });
  }, [accuracy, alignedGraphData, characters.length, currentPhrase, scoreStorageKey]);

  const clearAllData = () => {
    clearUserData();
    clearGraphData();
    setGraphState(defaultGraphState);
    setPageState("none");
    setStartPageTransition(false);
    setErrorDTW(null);
  };

  useErrorAlerts({
    errorDTW,
    pageState,
    clearAllData,
  });

  const shouldShowScoreCard =
    showScore &&
    pageState !== "none" &&
    pageState !== "playingReferenceAudio" &&
    pageState !== "playingUserAudio" &&
    alignedGraphData.length > 0;

  const shouldShowReferenceChart =
    showCharts &&
    graphState === "reference" &&
    referencePitch.length > 0;

  const shouldShowUserChart =
    showCharts &&
    graphState === "user" &&
    userPitch.length > 0;

  const shouldShowAlignedChart =
    showCharts &&
    graphState === "both" &&
    alignedGraphData.length > 0;

  return (
    <div className="app-shell h-full min-h-0 grid grid-rows-[auto_minmax(0,1fr)_auto] gap-[clamp(0.35rem,1.2vh,0.75rem)] justify-items-center text-center relative px-2 pt-2 pb-2 sm:px-3 sm:pt-2 sm:pb-3 overflow-hidden">
      {shouldShowScoreCard && (
        <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20 scale-[0.82] origin-top-right sm:scale-90 md:scale-100">
          <Score accuracy={accuracy} />
        </div>
      )}

      <header className="w-full flex flex-col items-center gap-[clamp(0.35rem,1.4vh,0.8rem)] pt-1">
        <CharacterDisplay
          currentTraditional={currentTraditional}
          currentSimplified={currentSimplified}
        />
        <PinyinDisplay
          currentPinyin={currentPinyin}
          currentHint={currentHint}
        />
      </header>

      <div className="min-h-0 w-full min-w-0 grid grid-cols-1 lg:[grid-template-columns:180px_minmax(0,1fr)] gap-2 sm:gap-3 items-stretch overflow-hidden">
        <div className="surface p-2 sm:p-3 w-full min-w-0 flex flex-col items-center justify-evenly lg:min-h-[320px]">
          {showPlaybackControls && pageState !== "none" && (
            <PlayUserAudio
              userPitchLength={userPitch.length}
              userAudioPath={userAudioPath ?? ""}
              setGraphState={setGraphState}
            />
          )}
          {showPlaybackControls &&
            pageState !== "none" &&
            pageState !== "playingUserAudio" && (
              <PlayReferenceAudio
                referencePitchLength={referencePitch.length}
                referenceAudioPath={referenceAudioPath}
                setGraphState={setGraphState}
              />
            )}
          {showPlaybackControls &&
            pageState !== "none" &&
            pageState !== "playingReferenceAudio" &&
            pageState !== "playingUserAudio" && (
              <ShowAlignedGraphs setGraphState={setGraphState} />
            )}
        </div>

        <div className="surface p-2 sm:p-3 w-full min-w-0 flex items-center justify-center overflow-hidden">
          <div className="w-full min-w-0">
            {shouldShowReferenceChart && (
              <PitchChart data={memoizedReferencePitch} color="#B0B0B0" />
            )}

            {shouldShowUserChart && (
              <PitchChart data={memoizedUserPitch} color="#4682B4" />
            )}

            {shouldShowAlignedChart && (
              <div className="w-full min-w-0">
                <AlignedPitchChart data={memoizedAlignedPitch} />
                <div className="relative w-full h-6 sm:h-7 mt-2 overflow-hidden text-stone-700 text-[clamp(0.65rem,2.1vw,0.85rem)]">
                  {refWordsArray.length > 0 &&
                    refWordsArray.map((word, i) => {
                      const firstStart = refWordsArray[0].start;
                      const totalDuration =
                        refWordsArray[refWordsArray.length - 1].end -
                          firstStart || 1;
                      const left =
                        ((word.start - firstStart) / totalDuration) * 100;
                      const width =
                        ((word.end - word.start) / totalDuration) * 100;

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

      <footer className="surface w-full grid grid-cols-3 items-center gap-2 px-[clamp(0.5rem,2.2vw,0.9rem)] py-[clamp(0.35rem,1.8vw,0.75rem)]">
        <div className="flex justify-start">
          <NextPhrase
            direction="previous"
            lessonId={lessonId}
            currentPhrase={currentPhrase}
            characters={characters}
            setCurrentPhrase={setCurrentPhrase}
            clearAllData={clearAllData}
            completionPath={completionPath}
          />
        </div>
        <div className="flex justify-center">
          <Record
            recording={recording}
            onStart={startRecording}
            onStop={stopRecording}
          />
        </div>
        <div className="flex justify-end">
          <NextPhrase
            direction="next"
            lessonId={lessonId}
            currentPhrase={currentPhrase}
            characters={characters}
            setCurrentPhrase={setCurrentPhrase}
            clearAllData={clearAllData}
            completionPath={completionPath}
          />
        </div>
      </footer>
    </div>
  );
}
