import { useEffect } from "react";
import { GraphState, PageState } from "src/app/session/page";

type Props = {
  errorDTW: string | null;
  pageState: PageState;
  clearAllData: () => void;
};

export function useErrorAlerts(props: Props) {
  useEffect(() => {
    const handleError = () => {
      if (props.errorDTW) {
        console.log("second here");
        alert(props.errorDTW);
        console.log(props.pageState);
        if (props.pageState !== "moveOn") {
          props.clearAllData();
        }
      }
    };
    handleError();
  }, [props.errorDTW]);
}
