'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useMemo } from 'react'
import { Mic, Play, Square, ArrowRight, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import React from 'react';

// Type for pitch points
type PitchPoint = {
  time: number;
  frequency: number;
};

// ✅ Memoized Chart Component
const PitchChart = React.memo(({ data }: { data: PitchPoint[] }) => {
  console.log('Rendering PitchChart'); // Debug
  return (
    <LineChart width={500} height={300} data={data}>
      <XAxis dataKey="time" tick={{ fontSize: 14 }} />
      <YAxis
        tick={{ fontSize: 14 }}
        domain={['dataMin - 0.5', 'dataMax + 0.5']}
        tickFormatter={(value) => value.toFixed(1)}
      />
      <Line
        type="monotone"
        dataKey="frequency"
        stroke="#8884d8"
        dot={false}
        strokeWidth={5}
      />
    </LineChart>
  );
});

export default function TestPage() {
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

  // ✅ Analyze reference audio
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

  // ✅ Timer logic
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
        router.push('/test_over');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fetch characters
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

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      setAudioURL(URL.createObjectURL(audioBlob));
      setUserBlob(audioBlob);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    };

    audioChunks.current = [];
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  useEffect(() => {
    setChosenAudio(`http://localhost:8000/sounds/${test}/${currentIndex}.mp3`);
  }, [currentPhrase]);

  const handleLeftClick = () => {
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

  // ✅ Memoize referencePitch for chart
  const memoizedPitch = useMemo(() => referencePitch, [referencePitch]);

  return (
    <div className='h-screen flex flex-col items-center text-center'>
      <header className='m-8 w-screen'>
        <div className='text-3xl font-bold bg-purple-500 p-3 rounded-xl border border-[#ffffff] mb-5'>
          Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
        <div className='font-bold text-[70px]'>{currentPhrase}</div>
        <div className='text-[60px]'>({currentPinyin})</div>
      </header>

      <div className="flex flex-row w-full h-100">
        <div>
          <button className='p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600' onClick={handleLeftClick}>
            <ArrowLeft />
          </button>
        </div>

        {group === "a" && (
          <div className='w-200 bg-blue-100 flex items-center justify-center mr-4 ml-4 text-black'>
            {memoizedPitch.length > 0 && <PitchChart data={memoizedPitch} />}
          </div>
        )}

        {group === "a" && (
          <div className='w-200 bg-green-100 flex items-center justify-center ml-4 mr-4 text-black'>
            graph 2
          </div>
        )}

        {group === "b" && (
          <>
            <div className='w-200 flex items-center justify-center mr-4 ml-4 text-black'>graph 1</div>
            <div className='w-200 flex items-center justify-center ml-4 mr-4 text-black'>graph 2</div>
          </>
        )}

        <div>
          <button className='p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600' onClick={handleRightClick}>
            <ArrowRight />
          </button>
        </div>
      </div>

      <footer className="grid grid-cols-2 w-screen p-8">
        <div>
          <button className="p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600" onClick={handlePlay}>
            <Play />
          </button>
        </div>
        <div>
          <button
            className={`p-4 rounded-full text-white ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            onClick={recording ? stopRecording : startRecording}>
            {recording ? <Square /> : <Mic />}
          </button>
        </div>
      </footer>
    </div>
  );
}
