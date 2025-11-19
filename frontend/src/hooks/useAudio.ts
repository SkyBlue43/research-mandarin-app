const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

import { useState, useEffect } from "react";

export function useAudio(test: string | null, currentIndex: string) {
  const [chosenAudio, setChosenAudio] = useState("");

  useEffect(() => {
    setChosenAudio(`${BASE}/sounds/${test}/${currentIndex}.mp3`);
  }, [currentIndex]);

  return { chosenAudio };
}
