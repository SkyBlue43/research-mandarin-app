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

  const [arrayIndex, setArrayIndex] = useState(0);
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
    <div className="h-screen flex flex-col items-center text-center">
      <header className="m-8 w-screen">
        <Timer userId={userId} />
      </header>

      <table className="border-collapse border border-white w-[600px] text-center">
        <thead>
          <tr className="border border-white">
            <th className="p-1">Chinese</th>
            <th className="p-1">Accuracy</th>
            <th className="p-1">Retry?</th>
          </tr>
        </thead>
        <tbody>
          {characters.map((char, i) => {
            const accuracy = accuracyArray[i]?.accuracy ?? null;

            let accuracyColor = "text-gray-400";
            if (accuracy !== null) {
              if (accuracy < 60) accuracyColor = "text-red-500";
              else if (accuracy > 80) accuracyColor = "text-green-500";
              else accuracyColor = "text-yellow-500";
            }

            return (
              <tr key={char.index} className="border border-white">
                <td className="p-2 text-xl font-bold">{char.simplified}</td>
                <td className={`p-2 text-xl ${accuracyColor}`}>
                  {accuracy !== null ? `${accuracy}%` : "—"}
                </td>
                <td className="p-2">
                  <button
                    className="border rounded bg-purple-500 hover:bg-purple-600 text-white p-1"
                    onClick={() =>
                      router.push(
                        `/redo?userId=${userId}&group=${group}&test=${test}&currentPhrase=${
                          Number(char.index) - 1
                        }`
                      )
                    }
                  >
                    Yes!
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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
