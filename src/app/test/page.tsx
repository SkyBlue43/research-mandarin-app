'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function TestPage() {
  const searchParams = useSearchParams();
  const test = searchParams.get('test');
  const group = searchParams.get('group')

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
    };
    fetchCharacters();
  }, [test]);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">You selected test: {test}</h1>
      <h1 className="text-xl font-bold">Group: {group}</h1>
    </div>
  );
}
