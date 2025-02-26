import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface User {
  token: string;
  profile_picture: string;
  name: string;
  email?: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; 
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const profile_picture = localStorage.getItem('profile_picture');
    const name = localStorage.getItem('name');
    if (token && profile_picture && name) {
    setUser({ token, profile_picture, name });
    // const tokenExpiry = localStorage.getItem('tokenExpiry');

    // if (token && profile_picture && name) {
      // const expiryDate = new Date(tokenExpiry);
      // if (expiryDate > new Date()) {
      // } else {
      //   localStorage.removeItem('token');
      //   localStorage.removeItem('profile_picture');
      //   localStorage.removeItem('name');
      //   localStorage.removeItem('tokenExpiry');
      // }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  return useContext(UserContext);
}