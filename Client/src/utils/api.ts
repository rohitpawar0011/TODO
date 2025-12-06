import axios from "axios";

// Prefer env var; fallback to deployed API or current origin
export const API_ROOT = import.meta.env.VITE_API_URL ;//|| "http://localhost:8080";

export const api = axios.create({
	baseURL: API_ROOT,
});

api.interceptors.request.use((config) => {
	const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
	if (token) {
		config.headers = config.headers ?? {};
		(config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error?.response?.status === 401) {
			// Token invalid/expired. Clear and redirect to login.
			if (typeof window !== "undefined") {
				localStorage.removeItem("token");
				// soft redirect; caller can also handle
				if (!location.pathname.startsWith("/login")) location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

export default api;


