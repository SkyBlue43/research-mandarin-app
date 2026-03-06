import { useEffect, useState } from "react";
import { transcribeAudio } from "src/services/api";

export function useAudioTranscriber(
  userBlob: Blob | null,
  referenceAudioPath: string,
  currentPhrase: string
) {
  const [transcribedWords, setTranscribedWords] = useState<any[]>([]);

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
  }, [userBlob]);

  return { transcribedWords };
}
