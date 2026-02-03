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
          `/testBranch?test=${data.test}&group=${data.group}&name=${
            data.name
          }&currentPhrase=${0}&isTest=${true}`
        );
      } else {
        router.push(
          `/session?test=${data.test}&group=${data.group}&name=${
            data.name
          }&currentPhrase=${0}`
        );
      }
    } catch (error: any) {
      console.error("Login error:", error.message);
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          className="text-white p-2 border-blue-500 border-2 m-4 focus:ring-gray-500 focus:border-gray-500"
          placeholder="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <input
          className="text-white p-2 border-blue-500 border-2 m-4 focus:ring-gray-500 focus:border-gray-500"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        className="m-2 p-2 bg-blue-500 text-lg text-black rounded hover:bg-gray-500"
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}
