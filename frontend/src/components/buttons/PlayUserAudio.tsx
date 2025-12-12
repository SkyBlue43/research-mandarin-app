import { Play } from "lucide-react";
import { GraphState } from "src/app/session/page";
import { useAlert } from "../../hooks/useAlert";

type Props = {
  userPitchLength: number;
  userAudioPath: string;
  setGraphState: (graphState: GraphState) => void;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function waitForAudioEnd(audio: HTMLAudioElement) {
  return new Promise<void>((resolve) => {
    audio.addEventListener("ended", () => resolve(), { once: true });
  });
}

export default function PlayUserAudio(props: Props) {
  const { showAlert, closeAlert } = useAlert();

  const handlePlayAudio = async (audioSrc: string) => {
    const audio = new Audio(audioSrc);
    try {
      showAlert("Playing your audio", "#3b82f6");
      props.setGraphState("user");
      await audio.play();

      await waitForAudioEnd(audio);
      await sleep(1000);

      closeAlert();
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  };
  return (
    <>
      {props.userPitchLength > 0 && (
        <div>
          <button
            className="p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => handlePlayAudio(props.userAudioPath)}
          >
            <Play />
          </button>
          <div className="mb-8">Your Audio</div>
        </div>
      )}
    </>
  );
}
