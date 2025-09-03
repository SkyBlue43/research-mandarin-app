import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useTimer(durationInSeconds: number, redirectPath?: string) {
    const [timeLeft, setTimeLeft] = useState(0);
    const router = useRouter();


    useEffect(() => {
        const storedEndTime = localStorage.getItem('timerEnd');
        let endTime: number;

        if (storedEndTime) {
            endTime = parseInt(storedEndTime, 10);
        } else {
            endTime = Date.now() + durationInSeconds * 1000; // ms
            localStorage.setItem('timerEnd', endTime.toString());
        }

        const updateTime = () => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) {
                localStorage.removeItem('timerEnd');
                if (redirectPath) {
                    router.push(redirectPath);
                }
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [durationInSeconds, redirectPath, router]);

    return timeLeft;
}