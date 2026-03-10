export default function Score({ accuracy }: { accuracy: number }) {
  if (accuracy === 0) return null;

  const config =
    accuracy < 60
      ? { color: "var(--danger)", text: "Needs More Work" }
      : accuracy < 80
      ? { color: "var(--warning)", text: "Almost There" }
      : { color: "var(--success)", text: "Great Work" };

  return (
    <div className="flex justify-center items-center">
      <div
        className="surface w-48 h-48 md:w-56 md:h-56 flex flex-col justify-center items-center border-4 font-bold text-center px-4"
        style={{
          borderColor: config.color,
          color: config.color,
        }}
      >
        <p className="text-xs uppercase tracking-[0.16em] text-stone-500 mb-2">
          Pronunciation Score
        </p>
        <p className="text-2xl md:text-3xl">{accuracy}%</p>
        <p className="text-sm md:text-base mt-2">{config.text}</p>
      </div>
    </div>
  );
}
