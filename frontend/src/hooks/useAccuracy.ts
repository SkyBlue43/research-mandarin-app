import { useEffect } from "react";
import { saveAccuracyData } from "../services/api";

export function useAccuracy(
  accuracy: number,
  test: string,
  name: string,
  array_index: string
) {
  useEffect(() => {
    saveAccuracyData(accuracy, test, name, array_index);
  }, [accuracy]);
}
