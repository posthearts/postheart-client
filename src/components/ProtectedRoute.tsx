import { Navigate } from 'react-router';
import { useUser } from '../context/UserContext';

import { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    const userContext = useUser();
    const user = userContext ? userContext.user : null;

    if (!user || !user.token) {
        return <Navigate to="/auth" />;
    }

    return children;
}