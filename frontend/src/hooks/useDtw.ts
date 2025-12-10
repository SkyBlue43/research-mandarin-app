import { useEffect, useState } from "react";
import { DTW } from "src/services/api";

type PitchPoint = {
  time: number;
  frequency: number;
};

export function useDtw(
  userPitch: PitchPoint[],
  referencePitch: PitchPoint[],
  test: string,
  transcribedWords: any[],
  currentIndex: string
) {
  const [alignedGraphData, setAlignedGraphData] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [refWordsArray, setRefWordsArray] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dtw = async () => {
      try {
        const [aligned_graph_data, total_accuracy, ref_characters] = await DTW(
          userPitch,
          referencePitch,
          test,
          transcribedWords,
          currentIndex
        );
        setAlignedGraphData(aligned_graph_data);
        setAccuracy(total_accuracy);
        setRefWordsArray(ref_characters);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
    };
    dtw();
  }, [transcribedWords]);

  return { refWordsArray, alignedGraphData, accuracy, error };
}
