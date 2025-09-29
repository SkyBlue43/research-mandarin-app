import { useEffect, useState } from "react";
import { shiftAudio } from "../services/api";

export function useShiftedAudio(
  referenceBlob: Blob | null,
  userBlob: Blob | null
) {
  const [correctedAudio, setCorrectedAudio] = useState("");

  useEffect(() => {
    if (referenceBlob && userBlob) {
      const getCorrectAudio = async () => {
        const data = await shiftAudio(referenceBlob, userBlob);
        setCorrectedAudio(data);
      };
      getCorrectAudio();
    }
  }, [userBlob]);

  return { correctedAudio };
}
