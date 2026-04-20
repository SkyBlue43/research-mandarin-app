import { useEffect, useState } from "react";
import { fetchCharacters } from "../services/api";

export type Character = {
  curriculumId: string;
  simplified: string;
  traditional: string;
  pinyin: string;
  index: string;
  hint: string;
};

export function useCharacters(lessonId: string | null, currentPhrase: number) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentSimplified, setCurrentSimplified] = useState("");
  const [currentTraditional, setCurrentTraditional] = useState("");
  const [currentPinyin, setCurrentPinyin] = useState("");
  const [currentIndex, setCurrentIndex] = useState("1");
  const [currentHint, setCurrentHint] = useState("");
  const [currentCurriculumId, setCurrentCurriculumId] = useState("1");

  const [charError, setCharError] = useState<string | null>(null);
  const [charLoading, setCharLoading] = useState(true);

  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setCharLoading(true);
        setCharError(null);

        const data = await fetchCharacters(lessonId);
        setCharacters(data.characters);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load characters";
        console.error("Error loading characters:", message);
        setCharError(message);
      } finally {
        setCharLoading(false);
      }
    };

    loadCharacters();
  }, [lessonId]);

  useEffect(() => {
    const curr = characters[currentPhrase];

    if (!curr) {
      setCurrentCurriculumId("1");
      setCurrentSimplified("");
      setCurrentTraditional("");
      setCurrentPinyin("");
      setCurrentIndex("1");
      setCurrentHint("");
      return;
    }

    setCurrentCurriculumId(curr.curriculumId);
    setCurrentSimplified(curr.simplified);
    setCurrentTraditional(curr.traditional);
    setCurrentPinyin(curr.pinyin);
    setCurrentIndex(curr.index);
    setCurrentHint(curr.hint);
  }, [characters, currentPhrase]);

  return {
    characters,
    currentCurriculumId,
    currentIndex,
    currentSimplified,
    currentTraditional,
    currentPinyin,
    currentHint,
    charError,
    charLoading,
  };
}
