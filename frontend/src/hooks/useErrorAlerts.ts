import { useEffect } from "react";
import { PageState } from "src/components/session/sessionTypes";

type Props = {
  errorDTW: string | null;
  pageState: PageState;
  clearAllData: () => void;
};

export function useErrorAlerts(props: Props) {
  const { errorDTW, pageState, clearAllData } = props;

  useEffect(() => {
    const handleError = () => {
      if (errorDTW) {
        alert(errorDTW);
        if (pageState !== "moveOn") {
          clearAllData();
        }
      }
    };
    handleError();
  }, [errorDTW, pageState, clearAllData]);
}
