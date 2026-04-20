"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import PracticeSession from "src/components/session/PracticeSession";

function SessionContent() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson");
  const currentPhraseIndex = Number(searchParams.get("currentPhrase") ?? "0");

  if (!lessonId) {
    return <div>Missing session details.</div>;
  }

  return (
    <div className="h-[100svh] overflow-hidden">
      <PracticeSession
        lessonId={lessonId}
        initialPhrase={currentPhraseIndex}
        showScore={true}
        showPlaybackControls={true}
        showCharts={true}
        autoPlayReview={true}
        completionPath="/finished"
      />
    </div>
  );
}

export default function Session() {
  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <SessionContent />
    </Suspense>
  );
}
