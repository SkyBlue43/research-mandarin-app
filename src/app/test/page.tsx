'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const [characters, setCharacters] = useState<any>([])
  const searchParams = useSearchParams();
  const test = searchParams.get('test');
  const group = searchParams.get('group')
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(900); // seconds
  const [arrayIndex, setArrayIndex] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentPinyin, setCurrentPinyin] = useState('');

  useEffect(() => {
    if (timeLeft === 0) {
      router.push('/test_over');
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  useEffect(() => {
    const fetchCharacters = async () => {
      const result = await fetch("http://localhost:8000/get-characters", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: test
        })
      });
      const data = await result.json();
      console.log(data);
      setCharacters(data.characters);
      setCurrentPhrase(data.characters[arrayIndex]['chinese']);
      setCurrentPinyin(data.characters[arrayIndex]['pinyin'])
    };
    fetchCharacters();
  }, [test]);

  return (
    <div className='h-screen flex flex-col items-center'>
      <header className='m-4'>
        <div className='text-3xl font-bold bg-blue-500 p-3 rounded-xl border border-[#ffffff]'>
          Time Left: {timeLeft}
        </div>
        <div>
          {currentPhrase}
        </div>
        <div>
          {currentPinyin}
        </div>
      </header>

      <div className="p-8">
        <h1 className="text-xl font-bold">You selected test: {test}</h1>
        <h1 className="text-xl font-bold">Group: {group}</h1>
      </div>
    </div>
  );
}
