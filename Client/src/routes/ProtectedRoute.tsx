import { ReactNode, useEffect } from "react";
import { useAuthStore } from "../stores/authStore";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
	const { token, loadFromStorage } = useAuthStore();

	useEffect(() => {
		loadFromStorage();
	}, [loadFromStorage]);

	if (!token) {
		if (typeof window !== "undefined" && !location.pathname.startsWith("/login")) {
			location.href = "/login";
		}
		return null;
	}

	return <>{children}</>;
}


