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
          className="control-btn p-3 bg-emerald-600 text-emerald-50 hover:bg-emerald-700"
          onClick={() => handleShowGraphs()}
        >
          <MousePointerClick />
        </button>
        <div className="control-label">See Both</div>
      </div>
    </>
  );
}
