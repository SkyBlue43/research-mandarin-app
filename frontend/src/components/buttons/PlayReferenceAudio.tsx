import { Play } from "lucide-react";

type Props = {
  referencePitchLength: number;
  referenceAudioPath: string;
};

export default function PlayReferenceAudio(props: Props) {
  const handlePlayAudio = async (audioSrc: string) => {
    const audio = new Audio(audioSrc);
    try {
      await audio.play();
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
