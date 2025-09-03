import { useTimer } from '@/lib/hooks/useTimer'

const Timer = (() => {
    const timeLeft = useTimer(900, '/');

    return (
        <div className='text-3xl font-bold bg-purple-500 p-3 rounded-xl border border-[#ffffff] mb-5'>
            Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
    )
})

export default Timer;