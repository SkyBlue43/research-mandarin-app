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
    <div className="text-3xl font-bold bg-purple-500 p-3 rounded-xl border border-[#ffffff] mb-5">
      Time Left: {Math.floor(timeLeft / 60)}:
      {String(timeLeft % 60).padStart(2, "0")}
    </div>
  );
};

export default Timer;
