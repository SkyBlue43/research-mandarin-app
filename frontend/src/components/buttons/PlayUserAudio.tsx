import { Play } from "lucide-react";
import { GraphState } from "src/components/session/sessionTypes";
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
            className="control-btn control-btn-primary p-3"
            onClick={() => handlePlayAudio(props.userAudioPath)}
          >
            <Play />
          </button>
          <div className="control-label">Your Audio</div>
        </div>
      )}
    </>
  );
}
