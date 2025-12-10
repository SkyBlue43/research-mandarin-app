import { useRef, useState } from "react";
import { GraphState, PageState } from "src/app/session/page";
import { analyzeAudio } from "src/services/api";

type PitchPoint = {
  time: number;
  frequency: number;
};

type Props = {
  setPageState: (pageState: PageState) => void;
  setGraphState: (graphState: GraphState) => void;
};

export function useAudioRecorder(props: Props) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [userAudioPath, setUserAudioPath] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [userPitch, setUserPitch] = useState<PitchPoint[]>([]);
  const [startPageTransition, setStartPageTransition] = useState(false);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "audio/mp4";

    const mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstart = () => {
      setTimeout(() => setRecording(true), 250);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const userAudioURL = URL.createObjectURL(audioBlob);
      setUserAudioPath(userAudioURL);
      const data = await analyzeAudio(audioBlob, "recording" + userAudioURL);
      setUserPitch(data.pitch);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      if (!startPageTransition) {
        setStartPageTransition(true);
        props.setPageState("playingUserAudio");
        props.setGraphState("user");
      }
    };

    audioChunksRef.current = [];
    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  return {
    startRecording,
    stopRecording,
    userAudioPath,
    recording,
    userPitch,
    setStartPageTransition,
  };
}
