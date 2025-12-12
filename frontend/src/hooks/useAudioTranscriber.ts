import { useEffect, useState } from "react";
import { transcribeAudio } from "src/services/api";

export function useAudioTranscriber(
  userBlob: Blob | null,
  referenceAudioPath: string,
  currentIndex: string
) {
  const [transcribedWords, setTranscribedWords] = useState<any[]>([]);

  useEffect(() => {
    const transcriber = async () => {
      const words = await transcribeAudio(
        userBlob,
        "recording" + referenceAudioPath,
        currentIndex
      );
      setTranscribedWords(words);
    };

    if (userBlob) {
      transcriber();
    }
  }, [userBlob]);

  return { transcribedWords };
}
