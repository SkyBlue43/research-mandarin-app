import { useEffect, useState } from "react";
import { fetchLessons } from "src/services/api";

export type LessonOption = {
  id: string;
  label: string;
};

export function useLessons() {
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLessons();
        setLessons(data.lessons ?? []);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load lessons";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, []);

  return { lessons, loading, error };
}
