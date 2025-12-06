import { create } from "zustand";
import { api, API_ROOT } from "../utils/api";

interface UserProfile {
	_id: string;
	name: string;
	email: string;
}

interface AuthState {
	token: string | null;
	user: UserProfile | null;
	isLoading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	signup: (name: string, email: string, password: string) => Promise<void>;
	logout: () => void;
	loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
	token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
	user: null,
	isLoading: false,
	error: null,

	login: async (email, password) => {
		set({ isLoading: true, error: null });
		try {
			const { data } = await api.post(`/api/auth/login`, { email, password });
			const token = data?.token as string;
			if (token) localStorage.setItem("token", token);
			set({ token });
			// fetch profile
			const profile = await api.get(`/api/auth/profile`);
			set({ user: profile.data, isLoading: false });
		} catch (err: any) {
			set({ isLoading: false, error: err?.response?.data?.message || "Login failed" });
			throw err;
		}
	},

	signup: async (name, email, password) => {
		set({ isLoading: true, error: null });
		try {
			await api.post(`/api/auth/signup`, { name, email, password });
			// auto-login after signup
			await (useAuthStore.getState().login as any)(email, password);
		} catch (err: any) {
			set({ isLoading: false, error: err?.response?.data?.message || "Signup failed" });
			throw err;
		}
	},

	logout: () => {
		localStorage.removeItem("token");
		set({ token: null, user: null });
	},

	loadFromStorage: async () => {
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
		if (!token) return;
		set({ token });
		try {
			const profile = await api.get(`/api/auth/profile`);
			set({ user: profile.data });
		} catch {
			localStorage.removeItem("token");
			set({ token: null, user: null });
		}
	},
}));


