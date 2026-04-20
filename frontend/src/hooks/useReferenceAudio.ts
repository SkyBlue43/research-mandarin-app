import { useState, useEffect } from "react";
import { fetchReferencePitch } from "src/services/api";

type PitchPoint = {
  time: number;
  frequency: number;
};

export function useReferenceAudio(lessonId: string, currentCurriculumId: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
  const [referenceAudioPath, setReferenceAudioPath] = useState("");
  const [referencePitch, setReferencePitch] = useState<PitchPoint[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(true);
  const [referenceError, setReferenceError] = useState<string | null>(null);

  useEffect(() => {
    const getReferenceAudio = async () => {
      if (!lessonId || !currentCurriculumId) {
        setReferencePitch([]);
        setReferenceLoading(false);
        setReferenceError(null);
        return;
      }

      const path = `${baseUrl}/sounds/${lessonId}/${currentCurriculumId}.mp3`;
      setReferenceAudioPath(path);
      setReferenceLoading(true);
      setReferenceError(null);

      try {
        const data = await fetchReferencePitch(lessonId, currentCurriculumId);
        setReferencePitch(data.pitch);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load reference audio";
        setReferencePitch([]);
        setReferenceError(message);
      } finally {
        setReferenceLoading(false);
      }
    };

    getReferenceAudio();
  }, [baseUrl, lessonId, currentCurriculumId]);

  return {
    referenceAudioPath,
    referencePitch,
    referenceLoading,
    referenceError,
  };
}
