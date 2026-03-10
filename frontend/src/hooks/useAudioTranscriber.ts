import { useEffect, useState } from "react";
import { transcribeAudio } from "src/services/api";

type TranscribedWord = {
  char: string;
  start: number;
  end: number;
};

export function useAudioTranscriber(
  userBlob: Blob | null,
  referenceAudioPath: string,
  currentPhrase: string
) {
  const [transcribedWords, setTranscribedWords] = useState<TranscribedWord[]>(
    []
  );

  useEffect(() => {
    const transcriber = async () => {
      const words = await transcribeAudio(
        userBlob,
        "recording" + referenceAudioPath,
        currentPhrase
      );
      setTranscribedWords(words ?? []);
    };

    if (userBlob) {
      transcriber();
    } else {
      setTranscribedWords([]);
    }
  }, [userBlob, referenceAudioPath, currentPhrase]);

  return { transcribedWords };
}
