import { useEffect } from "react";
import { saveAccuracyData } from "../services/api";

export function useAccuracy(
  accuracy: number,
  name: string,
  array_index: string
) {
  useEffect(() => {
    saveAccuracyData(accuracy, name, array_index);
  }, [accuracy]);
}
