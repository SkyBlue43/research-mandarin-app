'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { Mic, Play, Square } from 'lucide-react';
import React from 'react';

import PitchChart from '@/ui/charts/PitchChart';
import AlignedPitchChart from '@/ui/charts/AlignedPitchCharts';
import Timer from '@/ui/Timer';
import { useTimer } from '@/lib/hooks/useTimer'
import { useAudioAnalysisReference, useAudioAnalysisUser } from '@/lib/hooks/useAudioAnalysis';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useAlert } from '@/lib/hooks/useAlert';
import { useCharacters } from '@/lib/hooks/useCharacters';
import { useAudio } from '@/lib/hooks/useAudio';

export default function TestPageReal() {
    const searchParams = useSearchParams();
    const test = searchParams.get('test');
    const group = searchParams.get('group');
    const timeLeft = useTimer(900, '/');

    const [arrayIndex, setArrayIndex] = useState(0);


    const [playReady, setPlayReady] = useState(false);
    const [graphState, setGraphState] = useState(0);
    const [state, setState] = useState(0);

    const { characters, currentIndex, currentSimplified, currentTraditional, currentPinyin, currentHint, changeWord} = useCharacters(test, arrayIndex)
    const { chosenAudio } = useAudio(test, currentIndex);
    const { startRecording, stopRecording, audioURL, recording, referenceBlob, userBlob, clearBlob } = useAudioRecorder();
    const { referencePitch, clearReferencePitch } = useAudioAnalysisReference(referenceBlob, chosenAudio);
    const { userPitch, userWordsArray, alignedGraphData, clearPitch, accuracy } = useAudioAnalysisUser(userBlob, chosenAudio, referencePitch, currentSimplified, test, currentIndex);
    // Fetch characters

    const handlePlay = async () => {
        setPlayReady(true);
        setGraphState(1);
        const audio = new Audio(chosenAudio);
        audio.play();
    };


    const { referenceAlert } = useAlert(handlePlay, setState, setGraphState, group);

    const handlePlayUser = async () => {
        setPlayReady(true);
        setGraphState(0);
        if (audioURL) {
            const audio = new Audio(audioURL);
            audio.play();
        }

    };

    const handlePlayCorrected = async () => {
        setPlayReady(true);
        if (userBlob) {
            setGraphState(2);
            setState(3)
            const blobUrl = URL.createObjectURL(userBlob);
            const audio = new Audio(blobUrl);
            audio.play();
        }
    };

    const handleRecording = () => {
        if (recording && state == 0) {
            stopRecording();
            referenceAlert();
        } else if (recording && state > 0) {
            stopRecording();
        } else {
            startRecording(chosenAudio);
        }
    };

    const handleRightClick = () => {
        setPlayReady(false);
        clearReferencePitch();
        clearPitch();
        clearBlob();
        setState(0);
        setGraphState(0);

        if (arrayIndex === 9) {
            setArrayIndex(0);
            changeWord('1', characters[0].simplified, characters[0].traditional, characters[0].pinyin, characters[0].hint)
        } else {
            setArrayIndex(arrayIndex + 1);
            changeWord(String(Number(currentIndex) + 1), characters[arrayIndex + 1].simplified, characters[arrayIndex + 1].traditional, characters[arrayIndex + 1].pinyin, characters[arrayIndex + 1].hint)
        }
    };

    // Memoize Pitches for charts
    const memoizedPitch = useMemo(() => referencePitch, [referencePitch]);
    const memoizedUserPitch = useMemo(() => userPitch, [userPitch]);
    const memoizedAlignedPitch = useMemo(() => alignedGraphData, [alignedGraphData]);

    return (
        <div className='h-screen flex flex-col items-center text-center'>
            <header className='m-8 w-screen'>
                <Timer timeLeft={timeLeft} />
                <div className='font-bold text-[70px]'>{currentSimplified}</div>
                <div className='text-[60px]'>({currentPinyin})</div>
            </header>

            <div className="grid grid-cols-3 w-screen h-100">
                <div>
                    {userPitch.length > 0 && <div>
                        <button className="p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600" onClick={handlePlayUser}>
                            <Play />
                        </button>
                        <div className='mb-8'>Your Audio</div>
                    </div>}
                    {referencePitch.length > 0 && state >= 1 && <div>
                        <button className="p-4 rounded-full bg-[#B0B0B0] text-white hover:bg-[#808080]" onClick={handlePlay}>
                            <Play />
                        </button>
                        <div className='mb-8'>Correct Audio</div>
                    </div>}
                    {state >= 2 && group == "a" && <div>
                        <button className="p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600" onClick={handlePlayCorrected}>
                            <Play />
                        </button>
                        <div className='mb-8'>Your Corrected Audio</div>
                    </div>}
                </div>

                {group === "a" && graphState == 1 && (
                    <div className='w-120 flex items-center justify-center mr-4 ml-4 text-black'>
                        {playReady && referencePitch.length > 0 && <PitchChart data={memoizedPitch} color={'#B0B0B0'} />}
                    </div>
                )}

                {group === "a" && graphState == 0 && (
                    <div className='w-120 flex items-center justify-center ml-4 mr-4 text-black'>
                        {userPitch.length > 0 && <PitchChart data={memoizedUserPitch} color='#4682B4' />}
                    </div>
                )}

                {group === "a" && graphState == 2 && (
                    <div className='flex items-center justify-center ml-4 mr-4 text-black'>
                        {alignedGraphData != undefined && alignedGraphData.length > 0 && <AlignedPitchChart data={memoizedAlignedPitch} />}
                    </div>
                )}

                {group === "b" && (
                    <>
                        <div className='flex items-center justify-center mr-4 ml-4'></div>
                    </>
                )}

                <div className='flex justify-center items-center'>
                    {accuracy != 0.0 && <div className="w-64 h-64 flex justify-center items-center rounded-lg border-4 border-[#4682B4] text-[#4682B4] font-bold text-xl">
                        {accuracy}%
                    </div>}
                </div>
            </div>

            <footer className="grid grid-cols-3 w-screen p-8">
                <div>
                </div>

                <div>
                    <button
                        className={`p-4 rounded-full text-white ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        onClick={handleRecording}>
                        {recording ? <Square /> : <Mic />}
                    </button>
                </div>

                <div>
                    {((group == 'b' && state == 1) || state == 3) && <button className='text-md p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600' onClick={handleRightClick}>
                        Next Phrase
                    </button>}
                </div>
            </footer>
        </div>
    );
}
