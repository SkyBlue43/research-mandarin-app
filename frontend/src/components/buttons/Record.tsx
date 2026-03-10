import { Mic, Square } from "lucide-react";

type Props = {
  recording: boolean;
  onStart: () => void;
  onStop: () => void;
};

export default function Record(props: Props) {
  const handleRecording = () => {
    if (props.recording) {
      props.onStop();
    } else {
      props.onStart();
      //startRecording(chosenAudio);
    }
  };
  return (
    <div>
      <button
        className={`control-btn p-4 text-white ${
          props.recording
            ? "bg-red-700 hover:bg-red-800"
            : "control-btn-primary"
        }`}
        onClick={handleRecording}
      >
        {props.recording ? <Square /> : <Mic />}
      </button>
    </div>
  );
}
