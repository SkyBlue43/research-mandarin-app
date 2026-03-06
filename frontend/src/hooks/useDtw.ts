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

export function useDtw(
  userPitch: PitchPoint[],
  referencePitch: PitchPoint[],
  test: string,
  transcribedWords: TranscribedPoint[],
  currentIndex: string
) {
  const [alignedGraphData, setAlignedGraphData] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [refWordsArray, setRefWordsArray] = useState<any[]>([]);
  const [errorDTW, setErrorDTW] = useState<string | null>(null);

  useEffect(() => {
    const dtw = async () => {
      try {
        setErrorDTW(null);
        const [aligned_graph_data, total_accuracy, ref_characters] = await DTW(
          userPitch!,
          referencePitch,
          test,
          transcribedWords,
          currentIndex
        );
        setAlignedGraphData(aligned_graph_data);
        setAccuracy(total_accuracy);
        setRefWordsArray(ref_characters);
      } catch (err: any) {
        setErrorDTW(err.message || "Unknown error");
      }
    };
    if (userPitch.length > 0) {
      dtw();
    }
  }, [transcribedWords, userPitch, referencePitch, test, currentIndex]);

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
