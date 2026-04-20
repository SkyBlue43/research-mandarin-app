"use client";

import { useEffect, useState } from "react";
import PracticeSession from "src/components/session/PracticeSession";
import { useLessons } from "src/hooks/useLessons";

export default function HomePage() {
  const { lessons, loading, error } = useLessons();
  const [lessonId, setLessonId] = useState("");

  useEffect(() => {
    if (lessons.length === 0) {
      return;
    }

    setLessonId((currentLessonId) => {
      if (currentLessonId && lessons.some((lesson) => lesson.id === currentLessonId)) {
        return currentLessonId;
      }

      return lessons[0].id;
    });
  }, [lessons]);

  return (
    <div className="h-[100svh] overflow-hidden px-2 py-2 sm:px-3 sm:py-3">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden">
        <div className="surface mb-2 flex flex-col gap-2 p-3 text-left sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-teal-700 font-semibold mb-1">
              Mandarin Tone Practice
            </p>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Choose a lesson and start recording
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              Each bundled CSV is its own lesson, and the reference graph appears immediately.
            </p>
          </div>

          <label className="flex flex-col gap-1 text-sm font-semibold text-stone-700 min-w-[13rem]">
            Lesson
            <select
              className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm sm:text-base font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
              disabled={loading || Boolean(error) || lessons.length === 0}
            >
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {loading && (
            <div className="surface flex h-full items-center justify-center px-6 text-center text-sm font-medium text-stone-500">
              Loading bundled lessons...
            </div>
          )}

          {!loading && error && (
            <div className="surface flex h-full items-center justify-center px-6 text-center text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && lessonId && (
            <PracticeSession
              key={lessonId}
              lessonId={lessonId}
              initialPhrase={0}
              showScore={true}
              showPlaybackControls={true}
              showCharts={true}
              autoPlayReview={true}
              completionPath="/finished"
            />
          )}
        </div>
      </div>
    </div>
  );
}
