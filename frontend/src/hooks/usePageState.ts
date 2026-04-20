import { useEffect } from "react";
import { useAlert } from "./useAlert";
import { GraphState, PageState } from "src/components/session/sessionTypes";

type Props = {
  pageState: PageState;
  setPageState: (pageState: PageState) => void;
  setGraphState: (graphState: GraphState) => void;
  userAudioPath: string;
  referenceAudioPath: string;
  enabled?: boolean;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function waitForAudioEnd(audio: HTMLAudioElement) {
  return new Promise<void>((resolve) => {
    audio.addEventListener("ended", () => resolve(), { once: true });
  });
}

export default function usePageState(props: Props) {
  const { showAlert, closeAlert } = useAlert();
  const {
    pageState,
    setPageState,
    setGraphState,
    userAudioPath,
    referenceAudioPath,
    enabled = true,
  } = props;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (pageState === "playingUserAudio") {
        if (cancelled) return;
        showAlert("Playing your audio", "#3b82f6");

        if (cancelled) return;
        const audio = new Audio(userAudioPath);
        if (cancelled) return;
        audio.play().catch(console.error);
        if (cancelled) return;

        await waitForAudioEnd(audio);
        if (cancelled) return;

        await sleep(1000);
        if (cancelled) return;

        closeAlert();
        setPageState("playingReferenceAudio");
        setGraphState("reference");
      } else if (pageState === "playingReferenceAudio") {
        showAlert("Playing the correct audio", "#d1d5db");

        const audio = new Audio(referenceAudioPath);
        audio.play().catch(console.error);

        await waitForAudioEnd(audio);
        if (cancelled) return;

        await sleep(1000);
        if (cancelled) return;

        closeAlert();
        setPageState("moveOn");
        setGraphState("both");
      } else if (pageState === "moveOn") {
        showAlert("You may move on or retry", "#22c55e");

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
  }, [
    pageState,
    referenceAudioPath,
    userAudioPath,
    setPageState,
    setGraphState,
    showAlert,
    closeAlert,
    enabled,
  ]);

  return;
}
