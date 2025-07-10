'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter();



  return (
    <div className="h-screen flex justify-center items-center">
      <div className='flex flex-row'>
        <div className='flex flex-col'>
          <button
            className="bg-green-500 hover:bg-green-600 text-[18px] text-black border rounded p-2 bolded px-4"
            onClick={() => router.push('/test?choice=1a')}>
            Test 1a
          </button>

          <button
            className="bg-blue-500 hover:bg-blue-600 text-[18px] text-black border rounded p-2 bolded px-4"
            onClick={() => router.push('/test?choice=1b')}>
            Test 1b
          </button>
        </div>

        <div className='flex flex-col'>
          <button
            className="bg-green-500 hover:bg-green-600 text-[18px] text-black border rounded p-2 bolded px-4"
            onClick={() => router.push('/test?choice=2a')}>
            Test 2a
          </button>

          <button
            className="bg-blue-500 hover:bg-blue-600 text-[18px] text-black border rounded p-2 bolded px-4"
            onClick={() => router.push('/test?choice=2b')}>
            Test 2b
          </button>
        </div>
      </div>
    </div>
  );
}
