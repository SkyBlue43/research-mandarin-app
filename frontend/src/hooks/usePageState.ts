import { useEffect } from "react";
import { useAlert } from "./useAlert";
import { GraphState, PageState } from "src/app/session/page";

type Props = {
  pageState: PageState;
  setPageState: (pageState: PageState) => void;
  setGraphState: (graphState: GraphState) => void;
  userAudioPath: string;
  referenceAudioPath: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function waitForAudioEnd(audio: HTMLAudioElement) {
  return new Promise<void>((resolve) => {
    audio.addEventListener("ended", () => resolve(), { once: true });
  });
}

export default function usePageState(props: Props) {
  const { showAlert, closeAlert } = useAlert();

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (props.pageState === "playingUserAudio") {
        if (cancelled) return;
        showAlert("Playing your audio", "#3b82f6");

        if (cancelled) return;
        const audio = new Audio(props.userAudioPath);
        if (cancelled) return;
        audio.play().catch(console.error);
        if (cancelled) return;

        await waitForAudioEnd(audio);
        if (cancelled) return;

        await sleep(1000);
        if (cancelled) return;

        closeAlert();
        props.setPageState("playingReferenceAudio");
        props.setGraphState("reference");
      } else if (props.pageState === "playingReferenceAudio") {
        showAlert("Playing the correct audio", "#d1d5db");

        const audio = new Audio(props.referenceAudioPath);
        audio.play().catch(console.error);

        await waitForAudioEnd(audio);
        if (cancelled) return;

        await sleep(1000);
        if (cancelled) return;

        closeAlert();
        props.setPageState("moveOn");
        props.setGraphState("both");
      } else if (props.pageState === "moveOn") {
        showAlert(
          "Displaying both graphs now. You may move on or retry",
          "#22c55e"
        );

        await sleep(3000);
        if (cancelled) return;

        closeAlert();
      }
    };

    run();

    return () => {
      closeAlert();
      cancelled = true;
    };
  }, [props.pageState]);

  return;
}
