export default function Score({ accuracy }: { accuracy: number }) {
  if (accuracy === 0) return null;

  const config =
    accuracy < 60
      ? { color: "#ef4444", text: "Got some work to do!" }
      : accuracy < 80
      ? { color: "#eab308", text: "Almost There!" }
      : { color: "#22c55e", text: "Good Job!" };

  return (
    <div className="flex justify-center items-center">
      <div
        className="w-64 h-64 flex justify-center items-center rounded-lg border-4 font-bold text-xl"
        style={{
          borderColor: config.color,
          color: config.color,
        }}
      >
        {config.text}
      </div>
    </div>
  );
}
