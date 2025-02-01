import React, { useContext } from 'react';
import { Navigate } from 'react-router';
import { UserContext } from '../context/UserContext';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { user } = useContext(UserContext) ?? { user: null };

    if (!user) {
        return <Navigate to="/auth" />;
    }

    return children;
};

export default ProtectedRoute;