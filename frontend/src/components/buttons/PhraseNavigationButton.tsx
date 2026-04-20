import { useRouter } from "next/navigation";
import { Character } from "src/hooks/useCharacters";

type Props = {
  direction: "previous" | "next";
  lessonId: string;
  currentPhrase: number;
  characters: Character[];
  setCurrentPhrase: (value: number | ((prev: number) => number)) => void;
  clearAllData: () => void;
  completionPath?: string;
  disabled?: boolean;
};

export default function PhraseNavigationButton(props: Props) {
  const router = useRouter();
  const isFirstPhrase = props.currentPhrase === 0;
  const isLastPhrase = props.currentPhrase === props.characters.length - 1;
  const isDisabled =
    props.disabled || props.characters.length === 0 || Number.isNaN(props.currentPhrase);

  const navigateToPhrase = (nextPhrase: number) => {
    props.clearAllData();
    props.setCurrentPhrase(() => nextPhrase);
  };

  const handlePreviousClick = () => {
    if (isFirstPhrase || isDisabled) {
      return;
    }

    navigateToPhrase(props.currentPhrase - 1);
  };

  const handleNextClick = () => {
    if (isDisabled) {
      return;
    }

    if (isLastPhrase) {
      props.clearAllData();
      props.setCurrentPhrase(() => 0);
      const params = new URLSearchParams({ lesson: props.lessonId });
      router.push(`${props.completionPath ?? "/finished"}?${params.toString()}`);
      return;
    }

    navigateToPhrase(props.currentPhrase + 1);
  };

  if (props.direction === "previous") {
    return (
      <button
        className="control-btn control-btn-primary text-sm md:text-base px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-45"
        onClick={handlePreviousClick}
        disabled={isDisabled || isFirstPhrase}
      >
        Previous
      </button>
    );
  }

  return (
    <button
      className="control-btn control-btn-primary text-sm md:text-base px-4 py-2.5 disabled:cursor-not-allowed disabled:opacity-45"
      onClick={handleNextClick}
      disabled={isDisabled}
    >
      {isLastPhrase ? "Finish Lesson" : "Next"}
    </button>
  );
}
