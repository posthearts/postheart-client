import React, { useContext } from 'react';
import { Navigate } from 'react-router';
import { UserContext } from '../context/UserContext';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const context = useContext(UserContext);
    const user = context?.user;

    if (!user) {
        return <Navigate to="/auth" />;
    }

    return children;
};

export default ProtectedRoute;