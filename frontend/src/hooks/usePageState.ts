import { useEffect } from "react";
import { useAlert } from "./useAlert";
import { PageState } from "src/app/session/page";

type Props = {
  pageState: PageState;
  setPageState: (pageState: PageState) => void;
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
    const run = async () => {
      if (props.pageState === "playingUserAudio") {
        showAlert("Playing your audio", "#3b82f6");

        const audio = new Audio(props.userAudioPath);
        audio.play().catch((err) => console.error("Audio error:", err));

        await waitForAudioEnd(audio);

        closeAlert();
        props.setPageState("playingReferenceAudio");
      } else if (props.pageState === "playingReferenceAudio") {
        showAlert("Playing the correct audio", "#d1d5db");

        const audio = new Audio(props.referenceAudioPath);
        audio.play().catch((err) => console.error("Audio error:", err));

        await waitForAudioEnd(audio);

        closeAlert();
        props.setPageState("moveOn");
      } else if (props.pageState === "moveOn") {
        showAlert(
          "Displaying both graphs now. You may move on or retry",
          "#22c55e"
        );

        await sleep(5000);
        closeAlert();
      }
    };

    run();
  }, [props.pageState]);

  return;
}
