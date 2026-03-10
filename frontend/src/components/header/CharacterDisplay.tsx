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
    <div className="surface px-4 py-3 md:px-6 md:py-4">
      <button
        className="control-btn bg-stone-200 text-stone-700 hover:bg-stone-300 text-sm px-3 py-1.5"
        onClick={toggleDisplay}
      >
        Show {showTraditional ? "Simplified" : "Traditional"}
      </button>
      <div className="font-bold text-[3rem] sm:text-[4rem] md:text-[5rem] leading-none tracking-tight mt-2">
        {showTraditional ? props.currentTraditional : props.currentSimplified}
      </div>
    </div>
  );
}
