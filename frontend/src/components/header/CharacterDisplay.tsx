import { useState } from "react";

type Props = {
  currentTraditional: string;
  currentSimplified: string;
};

export default function CharacterDisplay(props: Props) {
  const [showTraditional, setShowTraditional] = useState(false);

  const toggleDisplay = () => {
    setShowTraditional(!showTraditional);
  };
  return (
    <div className="surface px-[clamp(0.5rem,2.5vw,1rem)] py-[clamp(0.4rem,2vh,0.9rem)]">
      <button
        className="control-btn bg-stone-200 text-stone-700 hover:bg-stone-300 text-[clamp(0.6rem,2.2vw,0.85rem)] px-2 py-0.5"
        onClick={toggleDisplay}
      >
        Show {showTraditional ? "Simplified" : "Traditional"}
      </button>
      <div className="font-bold text-[clamp(2rem,9vw,4rem)] leading-none tracking-tight mt-1">
        {showTraditional ? props.currentTraditional : props.currentSimplified}
      </div>
    </div>
  );
}
