"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, Suspense } from "react";
import { Mic, Play, Square } from "lucide-react";

import PitchChart from "../../components/charts/PitchChart";
import AlignedPitchChart from "../../components/charts/AlignedPitchCharts";
import Timer from "../../components/Timer";
import {
  useAudioAnalysisReference,
  useAudioAnalysisUser,
} from "../../hooks/useAudioAnalysis";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { useCharacters } from "../../hooks/useCharacters";
import { useAudio } from "../../hooks/useAudio";
import { useShiftedAudio } from "../../hooks/useShiftedAudio";
import { useAccuracy } from "../../hooks/useAccuracy";
import { useAlert } from "../../hooks/useAlert";

function TestPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const test = searchParams.get("test");
  const group = searchParams.get("group");
  const name = searchParams.get("name");

  const [arrayIndex, setArrayIndex] = useState(0);
  const [wordState, setWordState] = useState(0);
  const [playReady, setPlayReady] = useState(false);
  const [graphState, setGraphState] = useState(0);
  const [state, setState] = useState(0);

  const {
    characters,
    currentIndex,
    currentSimplified,
    currentTraditional,
    currentPinyin,
    currentHint,
    changeWord,
  } = useCharacters(test, arrayIndex);

  const { chosenAudio } = useAudio(test, currentIndex);

  const {
    startRecording,
    stopRecording,
    audioURL,
    recording,
    referenceBlob,
    userBlob,
    clearBlob,
  } = useAudioRecorder();

  const { referencePitch, clearReferencePitch } = useAudioAnalysisReference(
    referenceBlob,
    chosenAudio
  );

  const { userPitch, alignedGraphData, refWordsArray, clearPitch, accuracy } =
    useAudioAnalysisUser(
      userBlob,
      chosenAudio,
      referencePitch,
      currentSimplified,
      test,
      currentIndex
    );

  const { correctedAudio } = useShiftedAudio(referenceBlob, userBlob);

  if (test && name && group) {
    useAccuracy(accuracy, name, test, group, currentSimplified, currentIndex);
  }

  const handlePlayAudio = async (
    audioSrc: string | null,
    graphStateValue: number,
    extraStateValue?: number
  ) => {
    setPlayReady(true);
    if (!audioSrc) return;

    setGraphState(graphStateValue);
    if (extraStateValue !== undefined) setState(extraStateValue);

    const audio = new Audio(audioSrc);
    try {
      await audio.play();
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  };

  const { referenceAlert } = useAlert(
    handlePlayAudio,
    chosenAudio,
    setState,
    setGraphState,
    group
  );

  const handleRecording = () => {
    if (recording && state === 0) {
      stopRecording();
      referenceAlert();
    } else if (recording) {
      stopRecording();
    } else {
      startRecording(chosenAudio);
    }
  };

  const handleRightClick = () => {
    setPlayReady(false);
    clearReferencePitch();
    clearPitch();
    clearBlob();
    setState(0);
    setGraphState(0);

    if (arrayIndex === characters.length - 1) {
      setArrayIndex(0);
      changeWord(
        "1",
        characters[0].simplified,
        characters[0].traditional,
        characters[0].pinyin,
        characters[0].hint
      );
      router.push(`finished?name=${name}&test=${test}&group=${group}`);
    } else {
      setArrayIndex(arrayIndex + 1);
      changeWord(
        String(Number(currentIndex) + 1),
        characters[arrayIndex + 1].simplified,
        characters[arrayIndex + 1].traditional,
        characters[arrayIndex + 1].pinyin,
        characters[arrayIndex + 1].hint
      );
    }
  };

  const handleWordState = () => {
    setWordState(wordState === 0 ? 1 : 0);
  };

  const memoizedPitch = useMemo(() => referencePitch, [referencePitch]);
  const memoizedUserPitch = useMemo(() => userPitch, [userPitch]);
  const memoizedAlignedPitch = useMemo(
    () => alignedGraphData,
    [alignedGraphData]
  );

  return (
    <div className="h-screen flex flex-col items-center text-center">
      <header className="m-8 w-screen">
        <Timer username={name} />
        <div>
          <button
            className="border bg-gray-500 p-1 rounded hover:bg-gray-600"
            onClick={handleWordState}
          >
            Change to: {wordState === 0 ? "Traditional" : "Simplified"}
          </button>
          <div className="font-bold text-[70px]">
            {wordState === 1 ? currentTraditional : currentSimplified}
          </div>
        </div>
        <div className="flex flex-row justify-center items-center">
          <div className="text-[60px]">({currentPinyin})</div>
          <button
            className="border rounded-full w-6 h-6 ml-4"
            title={currentHint}
          >
            ?
          </button>
        </div>
      </header>

      <div className="grid [grid-template-columns:1fr_4fr_1fr] w-screen h-100">
        <div>
          {userPitch.length > 0 && (
            <div>
              <button
                className="p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => handlePlayAudio(audioURL, 0)}
              >
                <Play />
              </button>
              <div className="mb-8">Your Audio</div>
            </div>
          )}
          {referencePitch.length > 0 && state >= 1 && (
            <div>
              <button
                className="p-4 rounded-full bg-[#B0B0B0] text-white hover:bg-[#808080]"
                onClick={() => handlePlayAudio(chosenAudio, 1)}
              >
                <Play />
              </button>
              <div className="mb-8">Correct Audio</div>
            </div>
          )}
          {state >= 2 && group === "a" && (
            <div>
              <button
                className="p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600"
                onClick={() => handlePlayAudio(correctedAudio, 2, 3)}
              >
                <Play />
              </button>
              <div className="mb-8">Your Corrected Audio</div>
            </div>
          )}
        </div>

        {group === "a" && graphState === 1 && (
          <div className="flex items-center justify-center mr-4 ml-4 text-black">
            {playReady && referencePitch.length > 0 && (
              <PitchChart data={memoizedPitch} color="#B0B0B0" />
            )}
          </div>
        )}

        {group === "a" && graphState === 0 && (
          <div className="flex flex-col items-center justify-center ml-4 mr-4 text-white">
            {userPitch.length > 0 && (
              <PitchChart data={memoizedUserPitch} color="#4682B4" />
            )}
          </div>
        )}

        {group === "a" && graphState === 2 && (
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
                      150 - chartLeftPadding - chartRightPadding;

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

        <div className="flex justify-center items-center">
          {accuracy !== 0.0 && (
            <div className="w-64 h-64 flex justify-center items-center rounded-lg border-4 border-[#4682B4] text-[#4682B4] font-bold text-xl">
              {accuracy}%
            </div>
          )}
        </div>
      </div>

      <footer className="grid grid-cols-3 w-screen p-8 pt-20">
        <div></div>
        <div>
          <button
            className={`p-4 rounded-full text-white ${
              recording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
            onClick={handleRecording}
          >
            {recording ? <Square /> : <Mic />}
          </button>
        </div>
        <div>
          {((group === "b" && state === 1) || state === 3) && (
            <button
              className="text-md p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600"
              onClick={handleRightClick}
            >
              Next Phrase
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function TestPageReal() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <TestPageContent />
    </Suspense>
  );
}
