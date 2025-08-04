'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useMemo } from 'react'
import { Mic, Play, Square, ArrowRight, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import React from 'react';
import Swal from 'sweetalert2'

// Type for pitch points
type PitchPoint = {
    time: number;
    frequency: number;
};

type AlignedPoint = {
    time: number;
    refernce: number;
    user: number;
};

// Memoized Chart Components
const PitchChart = React.memo(({ data }: { data: PitchPoint[] }) => {
    return (
        <LineChart width={600} height={400} data={data}>
            <XAxis tick={false} dataKey="time" />
            <YAxis
                tick={false}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => value.toFixed(1)}
            />
            <Line
                type="monotone"
                dataKey="frequency"
                stroke="#FF69B4"
                dot={false}
                strokeWidth={5}
            />
        </LineChart>
    );
});

const UserPitchChart = React.memo(({ data }: { data: PitchPoint[] }) => {
    return (
        <LineChart width={600} height={400} data={data}>
            <XAxis tick={false} dataKey="time" />
            <YAxis
                tick={false}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => value.toFixed(1)}
            />
            <Line
                type="monotone"
                dataKey="frequency"
                stroke="#82ca9d"
                dot={false}
                strokeWidth={5}
            />
        </LineChart>
    );
});

const AlignedPitchChart = React.memo(({ data }: { data: AlignedPoint[] }) => {
    return (
        <LineChart width={600} height={400} data={data}>
            <XAxis tick={false} dataKey="time" />
            <YAxis
                tick={false}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => value.toFixed(1)}
            />
            <Line
                type="monotone"
                dataKey="reference"
                stroke="#FF69B4"
                dot={false}
                strokeWidth={5}
                name="Reference"
            />
            <Line
                type="monotone"
                dataKey="user"
                stroke="#82ca9d"
                dot={false}
                strokeWidth={5}
                name="User"
            />
        </LineChart>
    );
});

export default function TestPageReal() {
    const [characters, setCharacters] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const test = searchParams.get('test');
    const group = searchParams.get('group');
    const router = useRouter();

    const [timeLeft, setTimeLeft] = useState(900);
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
    const [referencePitch, setReferencePitch] = useState<PitchPoint[]>([]);
    const [userPitch, setUserPitch] = useState<PitchPoint[]>([]);
    const [playReady, setPlayReady] = useState(false);
    const [recordReady, setRecordReady] = useState(false);
    const [userWordsArray, setUserWordsArray] = useState<any[]>([]);
    const [alignedGraphData, setAlignedGraphData] = useState<any[]>([]);

    // Analyze reference and user audio
    useEffect(() => {
        const analyzeReference = async () => {
            if (!referenceBlob) return;
            const data = await analyzeAudio(referenceBlob, chosenAudio);
            if (data && JSON.stringify(data.pitch) !== JSON.stringify(referencePitch)) {
                setReferencePitch(data.pitch);
            }
        };
        analyzeReference();
    }, [referenceBlob, chosenAudio]);


    useEffect(() => {
        const analyzeUser = async () => {
            const data = await analyzeAudio(userBlob, "recording" + chosenAudio);
            if (data) {
                setUserPitch(data.pitch);

                if (referencePitch.length > 0) {
                    const user_chars_array = await transcribeAudio(userBlob, "recording" + chosenAudio, currentPhrase);
                    setUserWordsArray(user_chars_array);

                    console.log("✅ User Character Segments:", user_chars_array);
                    DTW(data.pitch, referencePitch, test, user_chars_array);
                }
            }
        };

        if (userBlob) {
            analyzeUser();
        }
    }, [userBlob, chosenAudio]);

    const transcribeAudio = async (
        audio_blob: Blob | null,
        audio_location: string,
        currentPhrase: string // ✅ New param
    ) => {
        if (audio_blob === null) return null;

        const formData = new FormData();
        formData.append("file", audio_blob, audio_location);
        formData.append("current_phrase", currentPhrase); // ✅ Send phrase to backend

        try {
            const result = await fetch("http://localhost:8000/transcribe/", {
                method: "POST",
                body: formData,
            });

            if (!result.ok) {
                console.error("❌ Failed to transcribe audio:", result.statusText);
                return null;
            }

            const data = await result.json();
            console.log("✅ Full API Response:", data);
            return data; // Array of {char, start, end}
        } catch (error) {
            console.error("❌ Error during fetch:", error);
            return null;
        }
    };

    const DTW = async (userPitch: PitchPoint[], referencePitch: PitchPoint[], test: string | null, userWordArray: any[]) => {
        const formData = new FormData();
        formData.append('reference_pitch', JSON.stringify({
            frequency: referencePitch.map(p => p.frequency),
            time: referencePitch.map(p => p.time)
        }));
        formData.append('user_pitch', JSON.stringify({
            frequency: userPitch.map(p => p.frequency),
            time: userPitch.map(p => p.time)
        }));
        formData.append('test', JSON.stringify(test));
        formData.append('currentIndex', JSON.stringify(currentIndex))
        formData.append('words_user', JSON.stringify(userWordArray));
        const result = await fetch('http://localhost:8000/dtw_characters', {
            method: 'POST',
            body: formData
        });
        const data = await result.json();
        console.log("DTW result:", data);
        setAlignedGraphData(data.alignment);
    };
    // useEffect(() => {
    //   const analyzeUser = async () => {
    //     const data = await analyzeAudio(userBlob, "recording" + chosenAudio);
    //     if (data) {
    //       setUserPitch(data.pitch);
    //       if (referencePitch.length > 0) {
    //       }
    //     }
    //   };

    //   if (userBlob) {
    //     analyzeUser();
    //   }
    // }, [userBlob, chosenAudio]);

    const analyzeAudio = async (audio_blob: Blob | null, audio_location: string) => {
        if (!audio_blob) return null;
        const formData = new FormData();
        formData.append('file', audio_blob, audio_location);
        const result = await fetch('http://localhost:8000/analyze-audio-voiceless', {
            method: 'POST',
            body: formData,
        });
        const data = await result.json();
        console.log('Pitch data:', data);
        return data;
    };

    // Timer logic
    useEffect(() => {
        const storedEndTime = localStorage.getItem('timerEnd');
        let endTime: number;

        if (storedEndTime) {
            endTime = parseInt(storedEndTime, 10);
        } else {
            endTime = Date.now() + 900 * 1000; // ms
            localStorage.setItem('timerEnd', endTime.toString());
        }

        const updateTime = () => {
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining === 0) {
                localStorage.removeItem('timerEnd');
                router.push('/');
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

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
        const audio = new Audio(chosenAudio);
        audio.play();
        const response = await fetch(chosenAudio);
        const blob = await response.blob();
        setReferenceBlob(blob);
    };

    const startRecording = async () => {
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
        await sleep(2000)  // wait 2 seconds
        Swal.fire({
          title: 'Heads up!',
          text: 'This is a SweetAlert2 modal.',
          icon: 'info',
        })
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
        setReferencePitch([]);
        setUserPitch([]);
        setReferenceBlob(null);
        setUserBlob(null);
        setAlignedGraphData([]);

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
        setReferencePitch([]);
        setUserPitch([]);
        setReferenceBlob(null);
        setUserBlob(null);
        setAlignedGraphData([])

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
                <div className='text-3xl font-bold bg-purple-500 p-3 rounded-xl border border-[#ffffff] mb-5'>
                    Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </div>
                <div className='font-bold text-[70px]'>{currentPhrase}</div>
                <div className='text-[60px]'>({currentPinyin})</div>
            </header>

            <div className="grid grid-cols-3 w-screen h-100">
                <div>
                    {userPitch.length > 0 && <div>
                        <button className="p-4 rounded-full bg-pink-500 text-white hover:bg-pink-600" onClick={handlePlay}>
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
                    {/* <button className="p-4 rounded-full bg-pink-500 text-white hover:bg-pink-600" onClick={handlePlay}>
                        <Play />
                    </button>
                    <div className='mb-8'>Your Corrected Audio</div> */}
                </div>

                {/* {group === "a" && (
                    <div className='w-120 flex items-center justify-center mr-4 ml-4 text-black'>
                        {playReady && referencePitch.length > 0 && <PitchChart data={memoizedPitch} />}
                    </div>
                )} */}

                {group === "a" && (
                    <div className='w-120 flex items-center justify-center ml-4 mr-4 text-black'>
                        {recordReady && userPitch.length > 0 && <UserPitchChart data={memoizedUserPitch} />}
                    </div>
                )}

                {/* {group === "a" && (
                    <div className='flex items-center justify-center ml-4 mr-4 text-black'>
                        {alignedGraphData != undefined && alignedGraphData.length > 0 && <AlignedPitchChart data={memoizedAlignedPitch} />}
                    </div>
                )} */}

                {group === "b" && (
                    <>
                        <div className='flex items-center justify-center mr-4 ml-4'></div>
                    </>
                )}

                <div>
                    Accuracy will go here
                </div>
            </div>

            <footer className="grid grid-cols-3 w-screen p-8">
                <div>
                    <button className='p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600' onClick={handleLeftClick}>
                        Last Phrase
                    </button>
                </div>

                <div>
                    <button
                        className={`p-4 rounded-full text-white ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        onClick={recording ? stopRecording : startRecording}>
                        {recording ? <Square /> : <Mic />}
                    </button>
                </div>

                <div>
                    <button className='text-md p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600' onClick={handleRightClick}>
                        Next Phrase
                    </button>
                </div>
            </footer>
        </div>
    );
}
