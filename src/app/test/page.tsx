'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function TestPage() {
  const searchParams = useSearchParams();
  const test = searchParams.get('test');
  const group = searchParams.get('group')

  const useEffect = () => {
    
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">You selected test: {test}</h1>
      <h1 className="text-xl font-bold">Group: {group}</h1>
    </div>
  );
}
