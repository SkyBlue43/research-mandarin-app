import { useRouter } from "next/navigation";
import { GraphState, PageState } from "src/app/session/page";
import { Character } from "src/hooks/useCharacters";

type Props = {
  name: string;
  test: string;
  group: string;
  setPageState: (pageState: PageState) => void;
  setGraphState: (graphState: GraphState) => void;
  currentPhrase: number;
  characters: Character[];
  setCurrentPhrase: (value: number | ((prev: number) => number)) => void;
  setStartPageTransition: (bool: boolean) => void;
  clearUserData: () => void;
};

export default function NextPhrase(props: Props) {
  const router = useRouter();
  const handleRightClick = () => {
    props.setPageState("none");
    props.setGraphState("none");
    props.setStartPageTransition(false);
    props.clearUserData();

    if (props.currentPhrase === props.characters.length - 1) {
      props.setCurrentPhrase(() => 0);
      router.push(
        `finished?name=${props.name}&test=${props.test}&group=${props.group}`
      );
    } else {
      props.setCurrentPhrase((prev) => prev + 1);
    }
  };

  return (
    <div>
      <button
        className="text-md p-4 rounded-full bg-purple-500 text-white hover:bg-purple-600"
        onClick={handleRightClick}
      >
        Next Phrase
      </button>
    </div>
  );
}
