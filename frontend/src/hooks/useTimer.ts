import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTest } from "../services/api";

export function useTimer(
  durationInSeconds: number,
  userId: string | null,
  test: string | null,
  redirectPath?: string,
  advanceTestOnExpire: boolean = false
) {
  const [timeLeft, setTimeLeft] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timerKey = `timerEnd:${userId ?? "anon"}:${test ?? "unknown"}`;
    const storedEndTime = localStorage.getItem(timerKey);
    let endTime: number;
    let handledExpiry = false;

    if (storedEndTime) {
      endTime = parseInt(storedEndTime, 10);
    } else {
      endTime = Date.now() + durationInSeconds * 1000; // ms
      localStorage.setItem(timerKey, endTime.toString());
    }

    const updateTime = () => {
      if (handledExpiry) return;
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        handledExpiry = true;
        localStorage.removeItem(timerKey);
        if (redirectPath) {
          const finish = async () => {
            try {
              if (advanceTestOnExpire) {
                await updateTest(userId);
              }
            } finally {
              router.push(redirectPath);
            }
          };
          finish();
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [durationInSeconds, userId, test, redirectPath, advanceTestOnExpire, router]);

  return timeLeft;
}
