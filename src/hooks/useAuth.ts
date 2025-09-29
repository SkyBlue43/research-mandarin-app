import { loginUser } from "@/services/authService";

export function useAuth() {
  async function login(username: string, password: string) {
    return await loginUser(username, password);
  }

  return { login };
}
