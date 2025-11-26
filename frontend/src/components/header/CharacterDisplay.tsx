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
    <div>
      <button
        className="border bg-gray-500 p-1 rounded hover:bg-gray-600"
        onClick={toggleDisplay}
      >
        Change to: {showTraditional ? "Traditional" : "Simplified"}
      </button>
      <div className="font-bold text-[70px]">
        {showTraditional ? props.currentTraditional : props.currentSimplified}
      </div>
    </div>
  );
}
