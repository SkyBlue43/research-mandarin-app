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
  isTest?: boolean;
};

export function useAudioRecorder(props: Props) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [userAudioPath, setUserAudioPath] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [userBlob, setUserBlob] = useState<Blob | null>(null);
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
      setUserBlob(audioBlob);
      const userAudioURL = URL.createObjectURL(audioBlob);
      setUserAudioPath(userAudioURL);
      const data = await analyzeAudio(audioBlob, "recording" + userAudioURL);
      if (!data?.pitch) {
        props.setPageState("none");
        props.setGraphState("none");
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        return;
      }

      setUserPitch(data.pitch);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      //This allows the state to start changing if it is not a test
      if (!startPageTransition && !props.isTest) {
        setStartPageTransition(true);
        props.setPageState("playingUserAudio");
        props.setGraphState("user");
      } else if (props.isTest) {
        props.setPageState("moveOn");
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

  const clearUserData = () => {
    setUserBlob(null);
    setUserPitch([]);
  };

  return {
    startRecording,
    stopRecording,
    userAudioPath,
    recording,
    userBlob,
    userPitch,
    setStartPageTransition,
    clearUserData,
  };
}
