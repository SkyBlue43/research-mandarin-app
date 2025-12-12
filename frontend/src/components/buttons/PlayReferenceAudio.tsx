import { Play } from "lucide-react";
import { GraphState } from "src/app/session/page";
import { useAlert } from "../../hooks/useAlert";

type Props = {
  referencePitchLength: number;
  referenceAudioPath: string;
  setGraphState: (graphState: GraphState) => void;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function waitForAudioEnd(audio: HTMLAudioElement) {
  return new Promise<void>((resolve) => {
    audio.addEventListener("ended", () => resolve(), { once: true });
  });
}

export default function PlayReferenceAudio(props: Props) {
  const { showAlert, closeAlert } = useAlert();

  const handlePlayAudio = async (audioSrc: string) => {
    const audio = new Audio(audioSrc);
    try {
      showAlert("Playing the correct audio", "#d1d5db");
      props.setGraphState("reference");
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
      {props.referencePitchLength > 0 && (
        <div>
          <button
            className="p-4 rounded-full bg-[#B0B0B0] text-white hover:bg-[#808080]"
            onClick={() => handlePlayAudio(props.referenceAudioPath)}
          >
            <Play />
          </button>
          <div className="mb-8">Correct Audio</div>
        </div>
      )}
    </>
  );
}
