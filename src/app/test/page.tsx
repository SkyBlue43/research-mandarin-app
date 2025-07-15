'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Mic, Play, Square, ArrowRight, ArrowLeft } from 'lucide-react';

export default function TestPage() {
  const [characters, setCharacters] = useState<any>([])
  const searchParams = useSearchParams();
  const test = searchParams.get('test');
  const group = searchParams.get('group')
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(900); // seconds
  const [arrayIndex, setArrayIndex] = useState(0);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [currentPinyin, setCurrentPinyin] = useState('');
  const [currentIndex, setCurrentIndex] = useState("1");
  const [chosenAudio, setChosenAudio] = useState('');
  const [audioChoice, setAudioChoice] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [referenceBlob, setReferenceBlob] = useState<Blob | null>(null);
  const [userBlob, setUserBlob] = useState<Blob | null>(null);

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
    updateTime(); // initial call
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

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
      setCharacters(data.characters);
      setCurrentPhrase(data.characters[arrayIndex]['chinese']);
      setCurrentPinyin(data.characters[arrayIndex]['pinyin']);
      setCurrentIndex(data.characters[arrayIndex]['index']);
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
      const url = URL.createObjectURL(audioBlob);
      setAudioURL(url);
      setUserBlob(audioBlob);

      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    };
    audioChunks.current = [];
    mediaRecorder.start();
    setRecording(true);
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  useEffect(() => {
    setChosenAudio(`http://localhost:8000/sounds/${test}/${currentIndex}.mp3`);
  }, [currentPhrase]);

  const handleLeftClick = () => {

  }

  const handleRightClick = () => {

  }

  return (
    <div className='h-screen flex flex-col items-center text-center'>
      <header className='m-8'>
        <div className='text-3xl font-bold bg-purple-500 p-3 rounded-xl border border-[#ffffff] mb-5'>
          Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
        <div className='font-bold text-[70px]'>
          {currentPhrase}
        </div>
        <div className='text-[60px]'>
          ({currentPinyin})
        </div>
      </header>

      <div className="flex flex-row w-full h-40">

        <div>
          <button className='p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600' onClick={handleLeftClick}>
            <ArrowLeft />
          </button>
        </div>

        <div className='flex-1 bg-blue-100 flex items-center justify-center'>
          graph 1
        </div>

        <div className='w-40 bg-green-100 flex items-center justify-center'>
          graph 2
        </div>

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
