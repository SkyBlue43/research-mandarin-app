import { useEffect } from "react";
import { saveAccuracyData } from "../services/api";

export function useAccuracy(
  accuracy: number,
  test: string,
  userId: number,
  array_index: string
) {
  useEffect(() => {
    saveAccuracyData(accuracy, test, userId, array_index);
  }, [accuracy]);
}
