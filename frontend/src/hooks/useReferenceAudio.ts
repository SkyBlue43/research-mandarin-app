const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

import { useState, useEffect } from "react";

export function useReferenceAudio(test: string, currentIndex: string) {
  const [referenceAudioPath, setReferenceAudioPath] = useState("");
  const [referenceBlob, setReferenceBlob] = useState<Blob | null>(null);

  useEffect(() => {
    const getReferenceAudio = async () => {
      const path = `${BASE}/sounds/${test}/${currentIndex}.mp3`;
      setReferenceAudioPath(path);
      const response = await fetch(path);
      const blob = await response.blob();
      setReferenceBlob(blob);
    };
    getReferenceAudio();
  }, [currentIndex]);

  return { referenceAudioPath, referenceBlob };
}
