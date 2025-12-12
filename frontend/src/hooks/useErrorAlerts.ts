import { useEffect } from "react";

type Props = {
  errorDTW: string | null;
};

export function useErrorAlerts(props: Props) {
  useEffect(() => {
    const handleError = () => {
      if (props.errorDTW) {
        alert(props.errorDTW);
      }
    };
    handleError();
  }, [props.errorDTW]);
}
