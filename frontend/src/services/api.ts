const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

type PitchPoint = {
  time: number;
  frequency: number;
};

type TranscribedPoint = {
  char: string;
  start: number;
  end: number;
};

export const DTW = async (
  userPitch: PitchPoint[],
  referencePitch: PitchPoint[],
  lessonId: string | null,
  userWordArray: TranscribedPoint[],
  currentIndex: string
) => {
  const body = {
    reference_pitch: {
      frequency: referencePitch.map((p) => p.frequency),
      time: referencePitch.map((p) => p.time),
    },
    user_pitch: {
      frequency: userPitch.map((p) => p.frequency),
      time: userPitch.map((p) => p.time),
    },
    lesson_id: lessonId,
    currentIndex,
    words_user: userWordArray,
  };
  const result = await fetch(`${BASE}/dtw-characters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!result.ok) {
    const error = await result.json();

    if (result.status === 422) {
      throw new Error(error.detail);
    }
    throw new Error(error.detail || "An error occurred.");
  }

  const data = await result.json();
  //console.log("DTW result:", data);
  return [data.alignment, data.accuracy, data.ref_characters];
};

export const transcribeAudio = async (
  audio_blob: Blob | null,
  audio_location: string,
  currentPhrase: string
) => {
  if (audio_blob === null) return null;

  const formData = new FormData();
  formData.append("file", audio_blob, audio_location);
  formData.append("data", currentPhrase);

  try {
    const result = await fetch(`${BASE}/transcribe`, {
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

export const analyzeAudio = async (
  audio_blob: Blob | null,
  audio_location: string
) => {
  if (!audio_blob) return null;
  const formData = new FormData();
  formData.append("file", audio_blob, audio_location);
  const result = await fetch(`${BASE}/analyze-audio`, {
    method: "POST",
    body: formData,
  });
  const data = await result.json();
  return data;
};

export const fetchCharacters = async (lessonId: string | null) => {
  try {
    const result = await fetch(`${BASE}/get-characters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lesson_id: lessonId }),
    });

    if (!result.ok) {
      const error = await result.json();
      throw new Error(error.detail || "Failed to fetch characters");
    }

    const data = await result.json();
    return data;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch characters";
    throw new Error(message);
  }
};

export const shiftAudio = async (referenceBlob: Blob, userBlob: Blob) => {
  const formData = new FormData();
  formData.append("reference", referenceBlob);
  formData.append("user", userBlob);
  const result = await fetch(`${BASE}/clone`, {
    method: "POST",
    body: formData,
  });
  const blob = await result.blob();
  const correctedAudioUrl = URL.createObjectURL(
    new Blob([blob], { type: "audio/mp4" })
  );

  return correctedAudioUrl;
};
