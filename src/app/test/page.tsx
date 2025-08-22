'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { Mic, Square } from 'lucide-react';
import React from 'react';

import { useAudioAnalysisReference, useAudioAnalysisUser } from '@/lib/hooks/useAudioAnalysis';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useCharacters } from '@/lib/hooks/useCharacters';
import { useAudio } from '@/lib/hooks/useAudio';

export default function Test() {
    const searchParams = useSearchParams();
    const test = searchParams.get('test');
    const [arrayIndex, setArrayIndex] = useState(0);

    const { characters, currentIndex, currentSimplified, currentTraditional, currentPinyin, currentHint, changeWord} = useCharacters(test, arrayIndex)
    const { chosenAudio } = useAudio(test, currentIndex);
    const { startRecording, stopRecording, audioURL, recording, referenceBlob, userBlob, clearBlob } = useAudioRecorder();
    const { referencePitch, clearReferencePitch } = useAudioAnalysisReference(referenceBlob, chosenAudio);
    const { userPitch, userWordsArray, alignedGraphData, clearPitch, accuracy } = useAudioAnalysisUser(userBlob, chosenAudio, referencePitch, currentSimplified, test, currentIndex);


    const handleRecording = () => {
        if (recording) {
            stopRecording();
        } else {
            startRecording(chosenAudio);
        }
    };

    return(
        <div className='h-screen flex flex-col items-center text-center'>
            <header className='m-8 w-screen'>
                <div className='font-bold text-[70px]'>{currentSimplified}</div>
                <div className='text-[60px]'>({currentPinyin})</div>
            </header>

            <main className="w-screen p-8">

                <div>
                    <button
                        className={`p-8 rounded-full text-white ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        onClick={handleRecording}>
                        {recording ? <Square /> : <Mic />}
                    </button>
                </div>

            </main>
        </div>
    );
}