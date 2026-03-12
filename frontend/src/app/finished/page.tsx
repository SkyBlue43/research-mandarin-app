"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Timer from "../../components/header/Timer";
import { useCharacters } from "../../hooks/useCharacters";
import { getHighestAccuracies } from "../../services/api";

interface AccuracyResult {
  chinese: string;
  accuracy: number;
}

function FinishedContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const group = searchParams.get("group");
  const test = searchParams.get("test");
  const router = useRouter();

  const arrayIndex = 0;
  const [accuracyArray, setAccuracyArray] = useState<AccuracyResult[]>([]);

  const { characters } = useCharacters(test, arrayIndex);

  useEffect(() => {
    if (userId && group && test) {
      getHighestAccuracies(Number(userId), group, test)
        .then((data) => setAccuracyArray(data))
        .catch((err) => console.error("Failed to fetch accuracies:", err));
    }
  }, [userId, group, test]);

  return (
    <div className="app-shell min-h-screen flex flex-col items-center text-center">
      <header className="w-full flex justify-center pt-3 mb-4">
        <Timer userId={userId} test={test} />
      </header>

      <div className="surface w-full max-w-3xl p-4 md:p-6 overflow-x-auto">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Session Results</h2>
        <table className="w-full min-w-[520px] text-center border-collapse">
          <thead>
            <tr className="border-b border-stone-300 text-stone-600 text-sm uppercase tracking-[0.12em]">
              <th className="p-2">Character</th>
              <th className="p-2">Accuracy</th>
              <th className="p-2">Retry</th>
            </tr>
          </thead>
          <tbody>
            {characters.map((char, i) => {
              const accuracy = accuracyArray[i]?.accuracy ?? null;

              let accuracyColor = "text-stone-400";
              if (accuracy !== null) {
                if (accuracy < 60) accuracyColor = "text-red-700";
                else if (accuracy > 80) accuracyColor = "text-emerald-700";
                else accuracyColor = "text-amber-700";
              }

              return (
                <tr key={char.index} className="border-b border-stone-200">
                  <td className="p-3 text-2xl font-bold">{char.simplified}</td>
                  <td className={`p-3 text-lg font-semibold ${accuracyColor}`}>
                    {accuracy !== null ? `${accuracy}%` : "—"}
                  </td>
                  <td className="p-3">
                    <button
                      className="control-btn control-btn-primary text-sm px-3 py-2"
                      onClick={() =>
                        router.push(
                          `/redo?userId=${userId}&group=${group}&test=${test}&currentPhrase=${
                            Number(char.index) - 1
                          }`
                        )
                      }
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
