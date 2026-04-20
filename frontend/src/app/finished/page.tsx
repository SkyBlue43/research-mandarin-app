"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCharacters } from "../../hooks/useCharacters";

function FinishedContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const router = useRouter();

  const arrayIndex = 0;
  const { characters } = useCharacters(lessonId, arrayIndex);
  const [lessonScores, setLessonScores] = useState<number[]>([]);

  useEffect(() => {
    if (!lessonId) {
      return;
    }

    const savedScores = sessionStorage.getItem(`lessonScores:${lessonId}`);
    if (!savedScores) {
      setLessonScores([]);
      return;
    }

    try {
      const parsedScores = JSON.parse(savedScores);
      setLessonScores(Array.isArray(parsedScores) ? parsedScores : []);
    } catch {
      setLessonScores([]);
    }
  }, [lessonId]);

  return (
    <div className="app-shell min-h-screen flex flex-col items-center text-center">
      <div className="surface w-full max-w-3xl p-4 md:p-6 overflow-x-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Session Results</h2>
        <p className="text-stone-600 text-sm mb-4">
          You finished the lesson. Here are the scores for each phrase in this run. Any phrase you did not score yet is shown as 0.
        </p>
        <table className="w-full min-w-[520px] text-center border-collapse">
          <thead>
            <tr className="border-b border-stone-300 text-stone-600 text-sm uppercase tracking-[0.12em]">
              <th className="p-2">Character</th>
              <th className="p-2">Pinyin</th>
              <th className="p-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {characters.map((char, index) => (
              <tr key={char.index} className="border-b border-stone-200">
                <td className="p-3 text-2xl font-bold">{char.simplified}</td>
                <td className="p-3 text-lg text-stone-700">{char.pinyin}</td>
                <td className="p-3 text-lg font-semibold text-stone-800">
                  {Math.round(lessonScores[index] ?? 0)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 flex justify-center">
          <button
            className="control-btn text-sm px-4 py-2"
            onClick={() => router.push("/")}
          >
            Back To Lessons
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Finished() {
  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <FinishedContent />
    </Suspense>
  );
}
