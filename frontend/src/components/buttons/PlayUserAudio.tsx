import { Play } from "lucide-react";

type Props = {
  userPitchLength: number;
  userAudioPath: string;
};

export default function PlayUserAudio(props: Props) {
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
