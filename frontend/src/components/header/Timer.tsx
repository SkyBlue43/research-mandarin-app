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
    <div className="surface inline-flex items-center gap-[clamp(0.4rem,1.8vw,0.75rem)] text-[clamp(0.95rem,3.2vw,1.4rem)] font-bold px-[clamp(0.6rem,2.2vw,1rem)] py-[clamp(0.3rem,1.6vw,0.6rem)]">
      <span className="text-stone-600 text-[clamp(0.5rem,1.8vw,0.7rem)] uppercase tracking-[0.14em]">
        Time Left
      </span>
      <span className="text-teal-700 tabular-nums">
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      </span>
    </div>
  );
};

export default Timer;
