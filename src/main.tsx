import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Editor from './LetterEditor';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { UserProvider } from './context/UserContext';

const router = createBrowserRouter([
  {
    path: '/letter',
    element: <Editor />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/auth',
    element: <AuthPage />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>
);