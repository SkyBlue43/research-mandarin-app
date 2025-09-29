import { useEffect, useState } from "react";

import { fetchCharacters } from "../../lib/api/api";

export function useCharacters(test: string | null, arrayIndex: number) {
  const [characters, setCharacters] = useState<any[]>([]);
  const [currentSimplified, setCurrentSimplified] = useState("");
  const [currentTraditional, setCurrentTraditional] = useState("");
  const [currentPinyin, setCurrentPinyin] = useState("");
  const [currentIndex, setCurrentIndex] = useState("1");
  const [currentHint, setCurrentHint] = useState("");

  useEffect(() => {
    const loadCharacters = async () => {
      const data = await fetchCharacters(test);
      setCharacters(data.characters);
      setCurrentSimplified(data.characters[arrayIndex].simplified);
      setCurrentTraditional(data.characters[arrayIndex].traditional);
      setCurrentPinyin(data.characters[arrayIndex].pinyin);
      setCurrentIndex(data.characters[arrayIndex].index);
      setCurrentHint(data.characters[arrayIndex].hint);
    };

    loadCharacters();
  }, [test]);

  const changeWord = (
    num: string,
    simplified: string,
    traditional: string,
    pinyin: string,
    hint: string
  ) => {
    setCurrentIndex(num);
    setCurrentSimplified(simplified);
    setCurrentTraditional(traditional);
    setCurrentHint(hint);
    setCurrentPinyin(pinyin);
  };

  return {
    characters,
    currentIndex,
    currentSimplified,
    currentTraditional,
    currentPinyin,
    currentHint,
    changeWord,
  };
}
