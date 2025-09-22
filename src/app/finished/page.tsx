"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import Timer from "@/ui/Timer";
import { useCharacters } from "@/lib/hooks/useCharacters";
import { getHighestAccuracies } from "@/lib/api/api";

interface AccuracyResult {
  chinese: string;
  accuracy: number;
}

export default function Finished() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const group = searchParams.get("group");
  const test = searchParams.get("test");
  const router = useRouter();

  const [arrayIndex, setArrayIndex] = useState(0);
  const [accuracyArray, setAccuracyArray] = useState<AccuracyResult[]>([]);

  const { characters } = useCharacters(test, arrayIndex);

  useEffect(() => {
    if (name && group && test) {
      getHighestAccuracies(name, group, test)
        .then((data) => {
          setAccuracyArray(data);
        })
        .catch((err) => {
          console.error("Failed to fetch accuracies:", err);
        });
    }
  }, [name, group, test]);

  return (
    <div className="h-screen flex flex-col items-center text-center">
      <header className="m-8 w-screen">
        <Timer username={name} />
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
                        `/redo?name=${name}&group=${group}&test=${test}&word_index=${
                          char.index - 1
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
