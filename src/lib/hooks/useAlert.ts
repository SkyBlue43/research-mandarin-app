import Swal from 'sweetalert2'

export function useAlert(
    handlePlay: () => void,
    setState: (state: number) => void,
    setGraphState: (state: number) => void
) { 
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const referenceAlert = async () => {
        await sleep(2000);
        Swal.fire({
            title: 'Heads up!',
            text: 'Click "OK" to hear and see the correct tone',
            icon: 'info',
        }).then((result) => {
            if (result.isConfirmed) {
                handlePlay();
                setState(1);
                referenceAlert2();
            }
        });
    };

    const referenceAlert2 = async () => {
        await sleep(2000);
        Swal.fire({
            title: 'Heads up!',
            text: 'You can now hear your own corrected voice with the golden button and practice on your own.\nWhen you have clicked on the golden button, you can move on to the next phrase.',
            icon: 'info',
        }).then((result) => {
            if (result.isConfirmed) {
                setState(2);
                setGraphState(2);
            }
        });
    };

    return { referenceAlert };
}