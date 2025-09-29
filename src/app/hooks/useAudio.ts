import {useState, useEffect} from 'react'

export function useAudio(test: string | null, currentIndex: string) {
    const [chosenAudio, setChosenAudio] = useState('');

    useEffect(() => {
        setChosenAudio(`http://localhost:8000/sounds/${test}/${currentIndex}.mp3`);
    }, [currentIndex]);

    return { chosenAudio }
}