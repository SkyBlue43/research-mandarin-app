'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useMemo, useEffect } from 'react'
import { Mic, Play, Square } from 'lucide-react';
import React from 'react';

import PitchChart from '@/ui/charts/PitchChart';
import AlignedPitchChart from '@/ui/charts/AlignedPitchCharts';
import Timer from '@/ui/Timer';
import { useAudioAnalysisReference, useAudioAnalysisUser } from '@/lib/hooks/useAudioAnalysis';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useAlert } from '@/lib/hooks/useAlert';
import { useCharacters } from '@/lib/hooks/useCharacters';
import { useAudio } from '@/lib/hooks/useAudio';
import { useShiftedAudio } from '@/lib/hooks/useShiftedAudio';
import { useAccuracy } from '@/lib/hooks/useAccuracy';

export default function RedoWord() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const test = searchParams.get('test');
    const group = searchParams.get('group');
    const name = searchParams.get('name');
    const wordIndex = searchParams.get('word_index');

    
    const [arrayIndex, setArrayIndex] = useState(() =>
        wordIndex !== null ? Number(wordIndex) : 0
      );
      
    const [wordState, setWordState] = useState(0);


    const [playReady, setPlayReady] = useState(false);
    const [graphState, setGraphState] = useState(0);
    const [state, setState] = useState(0);

    const { characters, currentIndex, currentSimplified, currentTraditional, currentPinyin, currentHint, changeWord } = useCharacters(test, arrayIndex)
    const { chosenAudio } = useAudio(test, currentIndex);
    const { startRecording, stopRecording, audioURL, recording, referenceBlob, userBlob, clearBlob } = useAudioRecorder();
    const { referencePitch, clearReferencePitch } = useAudioAnalysisReference(referenceBlob, chosenAudio);
    const { userPitch, userWordsArray, refWordsArray, alignedGraphData, clearPitch, accuracy } = useAudioAnalysisUser(userBlob, chosenAudio, referencePitch, currentSimplified, test, currentIndex);
    const { correctedAudio } = useShiftedAudio(referenceBlob, userBlob)
    if (test && name && group) {
        useAccuracy(accuracy, name, test, group, currentSimplified, currentIndex);
    }

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
        if (correctedAudio) {
            setGraphState(2);
            setState(3)
            const audio = new Audio(correctedAudio);
            audio.addEventListener("error", (e) => {
                console.error("Audio error:", e, audio.error);
            });
            audio.play().catch(err => console.error("Play failed:", err));

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

        setArrayIndex(0);
        changeWord('1', characters[0].simplified, characters[0].traditional, characters[0].pinyin, characters[0].hint)
        router.push(`finished?name=${name}&test=${test}&group=${group}`);
        
    };

    const handleWordState = () => {
        if (wordState === 0) {
            setWordState(1);
        }
        else {
            setWordState(0);
        }
    }

    // Memoize Pitches for charts
    const memoizedPitch = useMemo(() => referencePitch, [referencePitch]);
    const memoizedUserPitch = useMemo(() => userPitch, [userPitch]);
    const memoizedAlignedPitch = useMemo(() => alignedGraphData, [alignedGraphData]);

    return (
        <div className='h-screen flex flex-col items-center text-center'>
            <header className='m-8 w-screen'>
                <Timer />
                <div>
                    <button className='border bg-gray-500 p-1 rounded hover:bg-gray-600' onClick={handleWordState}>Change to: {wordState === 0 ? 'Traditional' : 'Simplified'}</button>
                    <div className='font-bold text-[70px]'>{wordState === 1 ? currentTraditional : currentSimplified}</div>
                </div>
                <div className='flex flex-row justify-center items-center'>
                    <div className='text-[60px]'>({currentPinyin})</div>
                    <button className='border rounded-full w-6 h-6 ml-4' title={currentHint}>?</button>
                </div>

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
                    <div className='flex items-center justify-center mr-4 ml-4 text-black'>
                        {playReady && referencePitch.length > 0 && <PitchChart data={memoizedPitch} color={'#B0B0B0'} />}
                    </div>
                )}

                {group === "a" && graphState == 0 && (
                    <div className='flex flex-col items-center justify-center ml-4 mr-4 text-white'>
                        {userPitch.length > 0 && <PitchChart data={memoizedUserPitch} color='#4682B4' />}
                    </div>
                )}

                {group === "a" && graphState == 2 && (
                    <div className='flex flex-col items-center justify-center ml-4 mr-4 text-white'>
                        {alignedGraphData != undefined && alignedGraphData.length > 0 && (
                            <>
                                <AlignedPitchChart data={memoizedAlignedPitch} />
                                <div
                                    style={{
                                        position: "relative",
                                        width: "100%",        
                                        height: "2rem",       
                                        marginTop: "1rem",    
                                    }}
                                >
                                    {refWordsArray.map((word, i) => {
                                        const firstStart = refWordsArray[0].start; // normalize start point
                                        const totalDuration = refWordsArray[refWordsArray.length - 1].end - firstStart;
                                        const chartLeftPadding = 8; // tweak until it lines up
                                        const chartRightPadding = 38; 
                                        const usableWidth = 150 - chartLeftPadding - chartRightPadding;
                                        
                                        const left =
                                          chartLeftPadding + ((word.start - firstStart) / totalDuration) * usableWidth;
                                        const width =
                                          ((word.end - word.start) / totalDuration) * usableWidth;

                                        return (
                                            <span
                                                key={i}
                                                style={{
                                                    position: "absolute",
                                                    left: `${left}%`,
                                                    width: `${width}%`,
                                                    textAlign: "center",
                                                }}
                                            >
                                                {word.char}
                                            </span>
                                        );
                                    })}
                                </div>

                            </>
                        )}
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

            <footer className="grid grid-cols-3 w-screen p-8 pt-20">
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
                        Return to List
                    </button>}
                </div>
            </footer>
        </div>
    );
}
