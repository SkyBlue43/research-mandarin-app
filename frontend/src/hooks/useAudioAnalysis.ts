import { useEffect, useState } from "react";
import { analyzeAudio, DTW, transcribeAudio } from "../services/api";

type PitchPoint = {
  time: number;
  frequency: number;
};

export function useAudioAnalysisUser(
  userBlob: Blob | null,
  referenceAudioPath: string,
  referencePitch: PitchPoint[],
  currentPhrase: string,
  test: string | null,
  currentIndex: string
) {
  const [userPitch, setUserPitch] = useState<PitchPoint[]>([]);
  const [userWordsArray, setUserWordsArray] = useState<any[]>([]);
  const [alignedGraphData, setAlignedGraphData] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [refWordsArray, setRefWordsArray] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeUser = async () => {
      const data = await analyzeAudio(
        userBlob,
        "recording" + referenceAudioPath
      );
      if (data) {
        setUserPitch(data.pitch);

        if (referencePitch.length > 0) {
          const user_chars_array = await transcribeAudio(
            userBlob,
            "recording" + referenceAudioPath,
            currentPhrase
          );
          setUserWordsArray(user_chars_array);

          //console.log("✅ User Character Segments:", user_chars_array);
          try {
            const [aligned_graph_data, total_accuracy, ref_characters] =
              await DTW(
                data.pitch,
                referencePitch,
                test,
                user_chars_array,
                currentIndex
              );
            setAlignedGraphData(aligned_graph_data);
            setAccuracy(total_accuracy);
            setRefWordsArray(ref_characters);
          } catch (err: any) {
            setError(err.message || "Unknown error");
          }
        }
      }
    };

    if (userBlob) {
      analyzeUser();
    }
  }, [userBlob, referenceAudioPath]);

  const clearPitch = () => {
    setUserPitch([]);
    setAlignedGraphData([]);
  };

  return {
    userPitch,
    userWordsArray,
    refWordsArray,
    alignedGraphData,
    clearPitch,
    accuracy,
    error,
  };
}
