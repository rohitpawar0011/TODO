import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { token, user, fetchProfile } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // If we have a token but no user, fetch the profile
        if (token && !user) {
            fetchProfile();
        }
    }, [token, user, navigate, fetchProfile]);

    if (!token) {
        return null;
    }

    return <>{children}</>;
};
