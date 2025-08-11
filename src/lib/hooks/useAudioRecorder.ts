import { useRef, useState } from 'react';

export function useAudioRecorder() {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [recording, setRecording] = useState(false);
    const [referenceBlob, setReferenceBlob] = useState<Blob | null>(null);
    const [userBlob, setUserBlob] = useState<Blob | null>(null);

    const startRecording = async (chosenAudio: string) => {
        const response = await fetch(chosenAudio);
        const blob = await response.blob();
        setReferenceBlob(blob);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/mp4';

        const mediaRecorder = new MediaRecorder(stream, { mimeType });

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstart = () => {
            setTimeout(() => setRecording(true), 250);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            setAudioURL(URL.createObjectURL(audioBlob));
            setUserBlob(audioBlob);
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        };

        audioChunksRef.current = [];
        mediaRecorder.start();
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const clearBlob = () => {
        setReferenceBlob(null);
        setUserBlob(null);
    }

    return {
        startRecording,
        stopRecording,
        audioURL,
        recording,
        referenceBlob,
        userBlob,
        clearBlob,
    };
}



