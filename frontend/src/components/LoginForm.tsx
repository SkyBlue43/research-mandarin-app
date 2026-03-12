"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(username, password);

      if (data.test === "pre" || data.test === "post") {
        router.push(
          `/testBranch?test=${data.test}&group=${data.group}&userId=${
            data.user_id
          }&currentPhrase=${0}&isTest=${true}`
        );
      } else {
        router.push(
          `/session?test=${data.test}&group=${data.group}&userId=${
            data.user_id
          }&currentPhrase=${0}`
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      console.error("Login error:", message);
      alert(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="surface w-[92vw] max-w-md p-6 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Mandarin Tone Lab</h1>
      <p className="text-stone-600 text-sm mb-6">
        Sign in to begin your pronunciation session.
      </p>

      <div className="mb-4">
        <input
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
          placeholder="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <input
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-700"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        className="control-btn control-btn-primary w-full text-base py-2.5"
        type="submit"
      >
        Start Session
      </button>
    </form>
  );
}
