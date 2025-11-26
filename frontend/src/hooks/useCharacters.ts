import { useEffect, useState } from "react";
import { fetchCharacters } from "../services/api";

export function useCharacters(test: string | null, currentPhrase: number) {
  const [characters, setCharacters] = useState<any[]>([]);
  const [currentSimplified, setCurrentSimplified] = useState("");
  const [currentTraditional, setCurrentTraditional] = useState("");
  const [currentPinyin, setCurrentPinyin] = useState("");
  const [currentIndex, setCurrentIndex] = useState("1");
  const [currentHint, setCurrentHint] = useState("");

  const [charError, setCharError] = useState<string | null>(null);
  const [charLoading, setCharLoading] = useState(true);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setCharLoading(true);
        setCharError(null);

        const data = await fetchCharacters(test);
        setCharacters(data.characters);

        const curr = data.characters[currentPhrase];
        if (curr) {
          setCurrentSimplified(curr.simplified);
          setCurrentTraditional(curr.traditional);
          setCurrentPinyin(curr.pinyin);
          setCurrentIndex(curr.index);
          setCurrentHint(curr.hint);
        }
      } catch (err: any) {
        console.error("Error loading characters:", err);
        setCharError(err.message || "Failed to load characters");
      } finally {
        setCharLoading(false);
      }
    };

    loadCharacters();
  }, [test, currentPhrase]);

  return {
    characters,
    currentIndex,
    currentSimplified,
    currentTraditional,
    currentPinyin,
    currentHint,
    charError,
    charLoading,
  };
}
