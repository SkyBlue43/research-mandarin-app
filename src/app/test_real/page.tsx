'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useMemo } from 'react'
import { Mic, Play, Square } from 'lucide-react';
import React from 'react';
import Swal from 'sweetalert2'

import PitchChart from '@/features/ui/charts/PitchChart';
import AlignedPitchChart from '@/features/ui/charts/AlignedPitchChart';
import Timer from '@/features/ui/timer/Timer';
import { getAccuracy } from '@/lib/api/api'
import { useTimer } from '@/lib/hooks/useTimer'
import { useAudioAnalysisReference, useAudioAnalysisUser } from '@/lib/hooks/useAudioAnalysis';

export default function TestPageReal() {
    const [characters, setCharacters] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const test = searchParams.get('test');
    const group = searchParams.get('group');
    const router = useRouter();
    const timeLeft = useTimer(900, '/');

    const [arrayIndex, setArrayIndex] = useState(0);
    const [currentPhrase, setCurrentPhrase] = useState('');
    const [currentPinyin, setCurrentPinyin] = useState('');
    const [currentIndex, setCurrentIndex] = useState("1");
    const [chosenAudio, setChosenAudio] = useState('');
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const [referenceBlob, setReferenceBlob] = useState<Blob | null>(null);
    const [userBlob, setUserBlob] = useState<Blob | null>(null);
    const [playReady, setPlayReady] = useState(false);
    const [recordReady, setRecordReady] = useState(false);
    const [accuracy, setAccuracy] = useState(0.0);
    const [graphState, setGraphState] = useState(0);
    const [state, setState] = useState(0);

    const { referencePitch, clearReferencePitch }  = useAudioAnalysisReference(referenceBlob, chosenAudio);
    const { userPitch, userWordsArray, alignedGraphData, clearPitch } = useAudioAnalysisUser(userBlob, chosenAudio, referencePitch, currentPhrase, test, currentIndex);


    // Calculates the accuracy on the backend
    useEffect(() => {
        const calculateAccuracy = async () => {
            const data = await getAccuracy(alignedGraphData);
            setAccuracy(data);

        }
        if (alignedGraphData) {
            calculateAccuracy()
        }
    }, [alignedGraphData])

    // Fetch characters
    useEffect(() => {
        const fetchCharacters = async () => {
            const result = await fetch("http://localhost:8000/get-characters", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ test })
            });
            const data = await result.json();
            setCharacters(data.characters);
            setCurrentPhrase(data.characters[arrayIndex].chinese);
            setCurrentPinyin(data.characters[arrayIndex].pinyin);
            setCurrentIndex(data.characters[arrayIndex].index);
        };
        fetchCharacters();
    }, [test]);

    const handlePlay = async () => {
        setPlayReady(true);
        setGraphState(1);
        const audio = new Audio(chosenAudio);
        audio.play();
    };

    const handlePlayUser = async () => {
        setPlayReady(true);
        if (userBlob) {
            setGraphState(0);
            console.log('userBlob:', userBlob);
            const blobUrl = URL.createObjectURL(userBlob);
            const audio = new Audio(blobUrl);
            console.log(blobUrl);
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

    const startRecording = async () => {
        const response = await fetch(chosenAudio);
        const blob = await response.blob();
        setReferenceBlob(blob);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.current.push(event.data);
        };

        mediaRecorder.onstart = () => {
            setTimeout(() => {
                setRecording(true);
            }, 250);
        };


        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
            setAudioURL(URL.createObjectURL(audioBlob));
            setUserBlob(audioBlob);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        };

        audioChunks.current = [];
        mediaRecorder.start();
    };


    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const referenceAlert = async () => {
        await sleep(3000);
        Swal.fire({
            title: 'Heads up!',
            text: 'Click "OK" to hear and see the correct tone',
            icon: 'info',
        }).then((result) => {
            if (result.isConfirmed) {
                handlePlay();
                setState(1);
                referenceAlert2();
            }
        });
    }


    const referenceAlert2 = async () => {
        await sleep(4000);
        Swal.fire({
            title: 'Heads up!',
            text: 'You can now hear your own corrected voice with the golden button and practice on your own.\nWhen you have clicked on the golden button, you can move on to the next phrase.',
            icon: 'info',
        }).then((result) => {
            if (result.isConfirmed) {
                setState(2);
                setGraphState(2);
            }
        });
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
        setRecordReady(true);
        referenceAlert();
    };

    useEffect(() => {
        setChosenAudio(`http://localhost:8000/sounds/${test}/${currentIndex}.mp3`);
    }, [currentIndex]);

    const handleLeftClick = () => {
        setPlayReady(false);
        setRecordReady(false);
        clearReferencePitch();
        clearPitch();
        setReferenceBlob(null);
        setUserBlob(null);

        if (arrayIndex === 0) {
            setArrayIndex(9);
            setCurrentIndex("10");
            setCurrentPhrase(characters[9].chinese);
            setCurrentPinyin(characters[9].pinyin);
        } else {
            setArrayIndex(arrayIndex - 1);
            setCurrentIndex(String(Number(currentIndex) - 1));
            setCurrentPhrase(characters[arrayIndex - 1].chinese);
            setCurrentPinyin(characters[arrayIndex - 1].pinyin);
        }
    };

    const handleRightClick = () => {
        setPlayReady(false);
        setRecordReady(false);
        clearReferencePitch();
        clearPitch();
        setReferenceBlob(null);
        setUserBlob(null);

        if (arrayIndex === 9) {
            setArrayIndex(0);
            setCurrentIndex("1");
            setCurrentPhrase(characters[0].chinese);
            setCurrentPinyin(characters[0].pinyin);
        } else {
            setArrayIndex(arrayIndex + 1);
            setCurrentIndex(String(Number(currentIndex) + 1));
            setCurrentPhrase(characters[arrayIndex + 1].chinese);
            setCurrentPinyin(characters[arrayIndex + 1].pinyin);
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
                <div className='font-bold text-[70px]'>{currentPhrase}</div>
                <div className='text-[60px]'>({currentPinyin})</div>
            </header>

            <div className="grid grid-cols-3 w-screen h-100">
                <div>
                    {userPitch.length > 0 && <div>
                        <button className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600" onClick={handlePlayUser}>
                            <Play />
                        </button>
                        <div className='mb-8'>Your Audio</div>
                    </div>}
                    {referencePitch.length > 0 && <div>
                        <button className="p-4 rounded-full bg-pink-500 text-white hover:bg-pink-600" onClick={handlePlay}>
                            <Play />
                        </button>
                        <div className='mb-8'>Correct Audio</div>
                    </div>}
                    {state >= 2 && <div>
                        <button className="p-4 rounded-full bg-yellow-500 text-white hover:bg-yellow-600" onClick={handlePlayCorrected}>
                            <Play />
                        </button>
                        <div className='mb-8'>Your Corrected Audio</div>
                    </div>}
                </div>

                {group === "a" && graphState == 1 && (
                    <div className='w-120 flex items-center justify-center mr-4 ml-4 text-black'>
                        {playReady && referencePitch.length > 0 && <PitchChart data={memoizedPitch} color={'#FF69B4'} />}
                    </div>
                )}

                {group === "a" && graphState == 0 && (
                    <div className='w-120 flex items-center justify-center ml-4 mr-4 text-black'>
                        {recordReady && userPitch.length > 0 && <PitchChart data={memoizedUserPitch} color='#82ca9d' />}
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
                    {accuracy != 0.0 && <div className="w-64 h-64 flex justify-center items-center rounded-lg border-4 border-green-500 text-green-600 font-bold text-xl">
                        {accuracy}%
                    </div>}
                </div>
            </div>

            <footer className="grid grid-cols-3 w-screen p-8">
                <div>
                    {/* <button className='p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600' onClick={handleLeftClick}>
                        Last Phrase
                    </button> */}
                </div>

                <div>
                    <button
                        className={`p-4 rounded-full text-white ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        onClick={recording ? stopRecording : startRecording}>
                        {recording ? <Square /> : <Mic />}
                    </button>
                </div>

                <div>
                    {state == 3 && <button className='text-md p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600' onClick={handleRightClick}>
                        Next Phrase
                    </button>}
                </div>
            </footer>
        </div>
    );
}
