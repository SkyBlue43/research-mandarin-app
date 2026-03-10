import Swal from "sweetalert2";

export function useAlert() {
  const showAlert = (message: string, color: string) => {
    Swal.fire({
      text: `\n${message}...\n`,
      position: "top-start",
      showConfirmButton: false,
      background: color,
      color: "white",
      toast: true,
    });
  };

  const closeAlert = () => Swal.close();

  return { showAlert, closeAlert };
}
