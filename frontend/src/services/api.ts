const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

type PitchPoint = {
  time: number;
  frequency: number;
};

export const DTW = async (
  userPitch: PitchPoint[],
  referencePitch: PitchPoint[],
  test: string | null,
  userWordArray: any[],
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
    test,
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
    const result = await fetch(`${BASE}/transcribe/`, {
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
  console.log("Pitch data:", data);
  return data;
};

export const fetchCharacters = async (test: string | null) => {
  try {
    const result = await fetch(`${BASE}/get-characters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test_number: test }),
    });
    const data = await result.json();
    return data;
  } catch (err: any) {
    throw new Error(err.message);
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

export const saveAccuracyData = async (
  accuracy: number,
  name: string,
  test: string,
  group: string,
  phrase: string,
  array_number: string
) => {
  const payload = {
    name,
    test,
    accuracy,
    group,
    phrase,
    array_number,
  };
  await fetch(`${BASE}/save-accuracy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

export const getHighestAccuracies = async (
  name: string,
  group: string,
  test: string
) => {
  const result = await fetch(`${BASE}/get-highest-accuracies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      test: test,
      name: name,
      group: group,
    }),
  });
  const data = await result.json();
  return data.accuracies;
};

export const updateTest = async (username: string | null) => {
  await fetch(`${BASE}/update-test`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
    }),
  });
};
