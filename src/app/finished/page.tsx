'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import Timer from '@/ui/Timer';
import { useCharacters } from '@/lib/hooks/useCharacters';
import { getHighestAccuracies } from '@/lib/api/api';

// need user, group, test
// with those things you can get the array of characters and their accuracy

interface AccuracyResult {
    chinese: string;
    accuracy: number;
  }

export default function Finished() {
    const searchParams = useSearchParams();
    const name = searchParams.get('name')
    const group = searchParams.get('group')
    const test = searchParams.get('test')

    const [arrayIndex, setArrayIndex] = useState(0);
    const [accuracyArray, setAccuracyArray] = useState<AccuracyResult[]>([]);

    const { characters, currentIndex, currentSimplified, currentTraditional, currentPinyin, currentHint, changeWord } = useCharacters(test, arrayIndex)

    if (name && group && test) {
        getHighestAccuracies(name, group, test)
        .then((data) => {
            setAccuracyArray(data);
        })
    }
    console.log(accuracyArray);

    return (
        <div className='h-screen flex flex-col items-center text-center'>
            <header className='m-8 w-screen'>
                <Timer />
            </header>

            <table className='border-collapse border border-white w-[700px] text-center'>
                <thead>
                    <tr className='border border-white'>
                        <th className='p-1'>Chinese</th>
                        <th>Accuracy</th>
                        <th>Retry?</th>
                    </tr>
                </thead>
                <tbody>
                    {characters.map((char) => (
                        <tr key={char.index} className='border border-white'>
                            <td className='p-2'>{char.simplified}</td>
                            <td>{accuracyArray[0].accuracy}</td>
                            <td>
                                <button className='border rounded bg-blue-500 text-white p-1'>
                                    here
                                </button>
                            </td>
                        </tr>
                    ))}
                    
                </tbody>
            </table>
        </div>

    )
}