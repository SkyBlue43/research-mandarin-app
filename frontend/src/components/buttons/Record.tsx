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
        className={`p-4 rounded-full text-white ${
          props.recording
            ? "bg-red-500 hover:bg-red-600"
            : "bg-green-500 hover:bg-green-600"
        }`}
        onClick={handleRecording}
      >
        {props.recording ? <Square /> : <Mic />}
      </button>
    </div>
  );
}
