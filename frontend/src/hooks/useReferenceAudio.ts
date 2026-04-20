const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

import { useState, useEffect } from "react";
import { analyzeAudio } from "src/services/api";

type PitchPoint = {
  time: number;
  frequency: number;
};

export function useReferenceAudio(lessonId: string, currentCurriculumId: string) {
  const [referenceAudioPath, setReferenceAudioPath] = useState("");
  const [referencePitch, setReferencePitch] = useState<PitchPoint[]>([]);

  useEffect(() => {
    const getReferenceAudio = async () => {
      const path = `${BASE}/sounds/${lessonId}/${currentCurriculumId}.mp3`;
      setReferenceAudioPath(path);
      const response = await fetch(path);
      const blob = await response.blob();
      const data = await analyzeAudio(blob, path);
      if (data) {
        setReferencePitch(data.pitch);
      }
    };
    getReferenceAudio();
  }, [lessonId, currentCurriculumId]);

  return { referenceAudioPath, referencePitch };
}
