'use client'

import { useSearchParams } from 'next/navigation'

export default function TestPage() {
  const searchParams = useSearchParams();
  const choice = searchParams.get('choice');

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">You selected: {choice}</h1>
    </div>
  );
}
