type PitchPoint = {
    time: number;
    frequency: number;
};


type AlignedPoint = {
    time: number;
    refernce: number;
    user: number;
};


export const DTW = async (userPitch: PitchPoint[], referencePitch: PitchPoint[], test: string | null, userWordArray: any[], currentIndex: string) => {
    const formData = new FormData();
    formData.append('reference_pitch', JSON.stringify({
        frequency: referencePitch.map(p => p.frequency),
        time: referencePitch.map(p => p.time)
    }));
    formData.append('user_pitch', JSON.stringify({
        frequency: userPitch.map(p => p.frequency),
        time: userPitch.map(p => p.time)
    }));
    formData.append('test', JSON.stringify(test));
    formData.append('currentIndex', JSON.stringify(currentIndex))
    formData.append('words_user', JSON.stringify(userWordArray));
    const result = await fetch('http://localhost:8000/dtw_characters', {
        method: 'POST',
        body: formData
    });
    const data = await result.json();
    console.log("DTW result:", data);
    return data.alignment;
};


export const getAccuracy = async (aligned: AlignedPoint[]) => {
    const response = await fetch('http://localhost:8000/accuracy/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aligned }),
    });
    const result = await response.json();
    return result.score;
}


export const transcribeAudio = async (
    audio_blob: Blob | null,
    audio_location: string,
    currentPhrase: string
) => {
    if (audio_blob === null) return null;

    const formData = new FormData();
    formData.append("file", audio_blob, audio_location);
    formData.append("current_phrase", currentPhrase);

    try {
        const result = await fetch("http://localhost:8000/transcribe/", {
            method: "POST",
            body: formData,
        });

        if (!result.ok) {
            console.error("❌ Failed to transcribe audio:", result.statusText);
            return null;
        }

        const data = await result.json();
        console.log("✅ Full API Response:", data);
        return data;
    } catch (error) {
        console.error("❌ Error during fetch:", error);
        return null;
    }
};

export const analyzeAudio = async (audio_blob: Blob | null, audio_location: string) => {
    if (!audio_blob) return null;
    const formData = new FormData();
    formData.append('file', audio_blob, audio_location);
    const result = await fetch('http://localhost:8000/analyze-audio-voiceless', {
        method: 'POST',
        body: formData,
    });
    const data = await result.json();
    console.log('Pitch data:', data);
    return data;
};