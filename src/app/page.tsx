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
            onClick={() => router.push('/test?group=a&test=1')}>
            Test 1a
          </button>

          <button
            className="bg-blue-500 hover:bg-blue-600 text-[18px] text-black border rounded p-2 bolded px-4"
            onClick={() => router.push('/test?group=b&test=1')}>
            Test 1b
          </button>
        </div>

        <div className='flex flex-col'>
          <button
            className="bg-green-500 hover:bg-green-600 text-[18px] text-black border rounded p-2 bolded px-4"
            onClick={() => router.push('/test?group=a&test=2')}>
            Test 2a
          </button>

          <button
            className="bg-blue-500 hover:bg-blue-600 text-[18px] text-black border rounded p-2 bolded px-4"
            onClick={() => router.push('/test?group=b&test=2')}>
            Test 2b
          </button>
        </div>
      </div>
    </div>
  );
}
