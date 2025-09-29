"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Mic, Square } from "lucide-react";
import React from "react";

import {
  useAudioAnalysisReference,
  useAudioAnalysisUser,
} from "@/app/hooks/useAudioAnalysis";
import { useAudioRecorder } from "@/app/hooks/useAudioRecorder";
import { useCharacters } from "@/app/hooks/useCharacters";
import { useAudio } from "@/app/hooks/useAudio";
import { useAccuracy } from "@/app/hooks/useAccuracy";
import { updateTest } from "@/services/api";

export default function Test() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const test = searchParams.get("test");
  const name = searchParams.get("name");
  const group = searchParams.get("group");
  const [arrayIndex, setArrayIndex] = useState(0);

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
  const { userPitch, userWordsArray, alignedGraphData, clearPitch, accuracy } =
    useAudioAnalysisUser(
      userBlob,
      chosenAudio,
      referencePitch,
      currentSimplified,
      test,
      currentIndex
    );
  if (test && name && group) {
    useAccuracy(accuracy, name, test, group, currentSimplified, currentIndex);
  }

  useEffect(() => {
    console.log("Accuracy: ", accuracy);
    if (accuracy === undefined) {
      alert("Unable to process audio. Try again");
    } else if (accuracy !== 0) {
      setState(1);
    }
  }, [accuracy]);

  const handleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording(chosenAudio);
    }
  };

  const handleNextPhrase = () => {
    clearReferencePitch();
    clearPitch();
    clearBlob();
    setState(0);

    if (arrayIndex === characters.length - 1) {
      setArrayIndex(0);
      changeWord(
        "1",
        characters[0].simplified,
        characters[0].traditional,
        characters[0].pinyin,
        characters[0].hint
      );
      updateTest(name);
      router.push("/");
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

  return (
    <div className="h-screen flex flex-col items-center text-center">
      <header className="m-8 w-screen mt-20">
        <div className="font-bold text-[70px]">{currentSimplified}</div>
        <div className="text-[60px]">({currentPinyin})</div>
      </header>

      <main className="w-screen p-8 mt-40">
        {state === 0 && (
          <div>
            <button
              className={`p-8 rounded-full text-white ${
                recording
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              onClick={handleRecording}
            >
              {recording ? <Square /> : <Mic />}
            </button>
          </div>
        )}

        {state === 1 && (
          <div>
            <button className={`p-8 rounded-full text-white bg-gray-400`}>
              <Mic />
            </button>
          </div>
        )}
      </main>

      {state === 1 && (
        <footer className="mt-50">
          <button
            className={
              "p-3 rounded text-white bg-blue-500 hover:bg-blue-600 text-lg"
            }
            onClick={handleNextPhrase}
          >
            Next
          </button>
        </footer>
      )}
    </div>
  );
}
