import { useRouter } from "next/navigation";
import { GraphState, PageState } from "src/app/session/page";
import { Character } from "src/hooks/useCharacters";

type Props = {
  userId: string;
  test: string;
  group: string;
  currentPhrase: number;
  characters: Character[];
  setCurrentPhrase: (value: number | ((prev: number) => number)) => void;
  clearAllData: () => void;
  sendBackToFinished?: Boolean;
  isTest?: Boolean;
};

export default function NextPhrase(props: Props) {
  const router = useRouter();
  const handleRightClick = () => {
    props.clearAllData();

    if (
      props.currentPhrase === props.characters.length - 1 ||
      props.sendBackToFinished
    ) {
      if (props.isTest) {
        router.push("/");
      }
      props.setCurrentPhrase(() => 0);
      router.push(
        `finished?userId=${props.userId}&test=${props.test}&group=${props.group}`
      );
    } else {
      props.setCurrentPhrase((prev) => prev + 1);
    }
  };

  return (
    <div>
      <button
        className="control-btn control-btn-primary text-sm md:text-base px-5 py-3"
        onClick={handleRightClick}
      >
        Next Phrase
      </button>
    </div>
  );
}
