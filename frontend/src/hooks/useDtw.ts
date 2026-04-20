import { useEffect, useState } from "react";
import { DTW } from "src/services/api";

type PitchPoint = {
  time: number;
  frequency: number;
};

type TranscribedPoint = {
  char: string;
  start: number;
  end: number;
};

type AlignedGraphPoint = {
  time: number;
  reference: number;
  user: number;
  accuracy: number;
};

type RefWord = {
  char: string;
  start: number;
  end: number;
};

export function useDtw(
  userPitch: PitchPoint[],
  referencePitch: PitchPoint[],
  lessonId: string,
  transcribedWords: TranscribedPoint[],
  currentIndex: string
) {
  const [alignedGraphData, setAlignedGraphData] = useState<AlignedGraphPoint[]>(
    []
  );
  const [accuracy, setAccuracy] = useState(0);
  const [refWordsArray, setRefWordsArray] = useState<RefWord[]>([]);
  const [errorDTW, setErrorDTW] = useState<string | null>(null);

  useEffect(() => {
    const dtw = async () => {
      try {
        setErrorDTW(null);
        const [aligned_graph_data, total_accuracy, ref_characters] = await DTW(
          userPitch!,
          referencePitch,
          lessonId,
          transcribedWords,
          currentIndex
        );
        setAlignedGraphData(aligned_graph_data);
        setAccuracy(total_accuracy);
        setRefWordsArray(ref_characters);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setErrorDTW(message);
      }
    };
    if (userPitch.length > 0) {
      dtw();
    }
  }, [transcribedWords, userPitch, referencePitch, lessonId, currentIndex]);

  const clearGraphData = () => {
    setAlignedGraphData([]);
    setRefWordsArray([]);
    setAccuracy(0);
    setErrorDTW(null);
  };

  return {
    refWordsArray,
    alignedGraphData,
    accuracy,
    errorDTW,
    setErrorDTW,
    clearGraphData,
  };
}
