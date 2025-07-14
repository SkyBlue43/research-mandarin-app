'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Mic, Play, Square } from 'lucide-react';

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
  const [chosenAudio, setChosenAudio] = useState('');
  const [audioChoice, setAudioChoice] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [referenceBlob, setReferenceBlob] = useState<Blob | null>(null);
  const [userBlob, setUserBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (timeLeft === 0) {
      router.push('/test_over');
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

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
      setCurrentPinyin(data.characters[arrayIndex]['pinyin'])
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
    setChosenAudio(`/backend/sounds${group}/${currentPhrase}.mp3`);
  }, [currentPhrase]);

  return (
    <div className='h-screen flex flex-col items-center text-center'>
      <header className='m-8'>
        <div className='text-3xl font-bold bg-blue-500 p-3 rounded-xl border border-[#ffffff] mb-5'>
          Time Left: {timeLeft}
        </div>
        <div className='font-bold text-[70px]'>
          {currentPhrase}
        </div>
        <div className='text-[60px]'>
          ({currentPinyin})
        </div>
      </header>

      <div className="grid grid-cols-2 w-screen p-8">
      <button className="p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600" onClick={handlePlay}>
            <Play />
          </button>
          <button
            className={`p-4 rounded-full text-white ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
            onClick={recording ? stopRecording : startRecording}>
            {recording ? <Square /> : <Mic />}
          </button>
      </div>
    </div>
  );
}
