const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

import { useState, useEffect } from "react";
import { analyzeAudio } from "src/services/api";

type PitchPoint = {
  time: number;
  frequency: number;
};

export function useReferenceAudio(test: string, currentIndex: string) {
  const [referenceAudioPath, setReferenceAudioPath] = useState("");
  const [referencePitch, setReferencePitch] = useState<PitchPoint[]>([]);

  useEffect(() => {
    const getReferenceAudio = async () => {
      const path = `${BASE}/sounds/${test}/${currentIndex}.mp3`;
      setReferenceAudioPath(path);
      const response = await fetch(path);
      const blob = await response.blob();
      const data = await analyzeAudio(blob, path);
      if (data) {
        setReferencePitch(data.pitch);
      }
    };
    getReferenceAudio();
  }, [currentIndex]);

  return { referenceAudioPath, referencePitch };
}
