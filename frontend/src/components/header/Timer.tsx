import { useTimer } from "../../hooks/useTimer";

type TimerProps = {
  userId: string | null;
  test: string | null;
  redirectPath?: string;
  advanceTestOnExpire?: boolean;
};

const Timer = ({
  userId,
  test,
  redirectPath,
  advanceTestOnExpire = false,
}: TimerProps) => {
  const timeLeft = useTimer(
    9000,
    userId,
    test,
    redirectPath,
    advanceTestOnExpire
  );

  return (
    <div className="surface inline-flex items-center gap-3 text-xl md:text-2xl font-bold px-4 py-2 md:px-5 md:py-3">
      <span className="text-stone-600 text-sm uppercase tracking-[0.14em]">
        Time Left
      </span>
      <span className="text-teal-700 tabular-nums">
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </span>
    </div>
  );
};

export default Timer;
