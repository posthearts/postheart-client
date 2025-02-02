import { Navigate } from 'react-router';
import { useUser } from '../context/UserContext';
import { ReactNode, useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const userContext = useUser();
    const user = userContext?.user;

    useEffect(() => {
        if (!user) {
            const token = localStorage.getItem('token');
            const name = localStorage.getItem('name');
            const profile_picture = localStorage.getItem('profile_picture');
            if (token && name && profile_picture) {
                userContext?.setUser({ token, name, profile_picture });
            }
        }
    }, [user, userContext]);

    if (!user || !user.token) {
        return <Navigate to="/auth" />;
    }

    return children;
}