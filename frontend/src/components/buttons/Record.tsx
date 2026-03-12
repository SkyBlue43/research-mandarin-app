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
    <div className="flex items-center justify-center">
      <button
        className={`control-btn p-[clamp(0.6rem,3vw,1rem)] text-white ${
          props.recording
            ? "bg-red-700 hover:bg-red-800"
            : "control-btn-primary"
        }`}
        onClick={handleRecording}
      >
        {props.recording ? (
          <Square className="h-[clamp(1rem,4vw,1.5rem)] w-[clamp(1rem,4vw,1.5rem)]" />
        ) : (
          <Mic className="h-[clamp(1rem,4vw,1.5rem)] w-[clamp(1rem,4vw,1.5rem)]" />
        )}
      </button>
    </div>
  );
}
