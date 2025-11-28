"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import NextPhrase from "src/components/buttons/NextPhrase";
import Record from "src/components/buttons/Record";
import CharacterDisplay from "src/components/header/CharacterDisplay";
import PinyinDisplay from "src/components/header/PinyinDisplay";
import Timer from "src/components/header/Timer";
import { useAudioRecorder } from "src/hooks/useAudioRecorder";
import { useCharacters } from "src/hooks/useCharacters";
import { useReferenceAudio } from "src/hooks/useReferenceAudio";

export default function Session() {
  const searchParams = useSearchParams();
  const test = searchParams.get("test");
  const group = searchParams.get("group");
  const name = searchParams.get("name");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [pageState, setPageState] = useState(0);

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

  const { referenceAudioPath, referenceBlob } = useReferenceAudio(
    test!,
    currentIndex
  );

  const {
    startRecording,
    stopRecording,
    userAudioPath,
    recording,
    userBlob,
    clearBlob,
  } = useAudioRecorder();

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

      <footer className="grid grid-cols-3 w-screen p-8 pt-20">
        <div></div>
        <Record
          recording={recording}
          onStart={startRecording}
          onStop={stopRecording}
        />
        <NextPhrase
          name={name!}
          test={test!}
          group={group!}
          currentPhrase={currentPhrase}
          pageState={pageState}
          characters={characters}
          setCurrentPhrase={setCurrentPhrase}
        />
      </footer>
    </div>
  );
}
