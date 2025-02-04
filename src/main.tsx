import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import Editor from './LetterEditor.tsx';
import AuthPage from './pages/AuthPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
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
  </StrictMode>,
);
