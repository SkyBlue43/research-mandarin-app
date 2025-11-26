"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import NextPhrase from "src/components/buttons/NextPhrase";
import CharacterDisplay from "src/components/header/CharacterDisplay";
import PinyinDisplay from "src/components/header/PinyinDisplay";
import Timer from "src/components/header/Timer";
import { useCharacters } from "src/hooks/useCharacters";

export default function Session() {
  const searchParams = useSearchParams();
  const test = searchParams.get("test");
  const group = searchParams.get("group");
  const name = searchParams.get("name");
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [pageState, setPageState] = useState(3);

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
        <div>
          {/* <button
            className={`p-4 rounded-full text-white ${
              recording
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
            onClick={handleRecording}
          >
            {recording ? <Square /> : <Mic />}
          </button> */}
        </div>
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
