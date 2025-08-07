import { useEffect, useState } from 'react';
import { analyzeAudio, DTW, transcribeAudio } from '../api/api';

type PitchPoint = {
    time: number;
    frequency: number;
};

export function useAudioAnalysisReference(referenceBlob: Blob | null, chosenAudio: string) {
    const [referencePitch, setReferencePitch] = useState<PitchPoint[]>([]);

    useEffect(() => {
        const analyzeReference = async () => {
            if (!referenceBlob) return;
            const data = await analyzeAudio(referenceBlob, chosenAudio);
            if (data && JSON.stringify(data.pitch) !== JSON.stringify(referencePitch)) {
                setReferencePitch(data.pitch);
            }
        };
        analyzeReference();
    }, [referenceBlob, chosenAudio]);

    const clearReferencePitch = () => {
        setReferencePitch([]);
    };

    return { referencePitch, clearReferencePitch }
}

export function useAudioAnalysisUser(userBlob: Blob | null, chosenAudio: string, referencePitch: PitchPoint[], currentPhrase: string, test: string | null, currentIndex: string) {
    const [userPitch, setUserPitch] = useState<PitchPoint[]>([]);
    const [userWordsArray, setUserWordsArray] = useState<any[]>([]);
    const [alignedGraphData, setAlignedGraphData] = useState<any[]>([]);

    useEffect(() => {
        const analyzeUser = async () => {
            const data = await analyzeAudio(userBlob, "recording" + chosenAudio);
            if (data) {
                setUserPitch(data.pitch);

                if (referencePitch.length > 0) {
                    const user_chars_array = await transcribeAudio(userBlob, "recording" + chosenAudio, currentPhrase);
                    setUserWordsArray(user_chars_array);

                    console.log("✅ User Character Segments:", user_chars_array);
                    const aligned_graph_data = await DTW(data.pitch, referencePitch, test, user_chars_array, currentIndex);
                    setAlignedGraphData(aligned_graph_data);
                }
            }
        };

        if (userBlob) {
            analyzeUser();
        }
    }, [userBlob, chosenAudio]);

    const clearPitch = () => {
        setUserPitch([]);
        setAlignedGraphData([]);
    }

    return { userPitch, userWordsArray, alignedGraphData, clearPitch }
}