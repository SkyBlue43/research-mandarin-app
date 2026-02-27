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
        alert(props.errorDTW);
        if (props.pageState !== "moveOn") {
          props.clearAllData();
        }
      }
    };
    handleError();
  }, [props.errorDTW]);
}
