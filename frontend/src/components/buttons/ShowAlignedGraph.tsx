import { MousePointerClick } from "lucide-react";
import { GraphState } from "src/app/session/page";
import { useAlert } from "../../hooks/useAlert";

type Props = {
  setGraphState: (graphState: GraphState) => void;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function PlayUserAudio(props: Props) {
  const { showAlert, closeAlert } = useAlert();

  const handleShowGraphs = async () => {
    showAlert(
      "Displaying both graphs now. You may move on or retry",
      "#22c55e"
    );
    props.setGraphState("both");

    await sleep(2000);

    closeAlert();
  };
  return (
    <>
      <div>
        <button
          className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600"
          onClick={() => handleShowGraphs()}
        >
          <MousePointerClick />
        </button>
        <div className="mb-8">See Both</div>
      </div>
    </>
  );
}
