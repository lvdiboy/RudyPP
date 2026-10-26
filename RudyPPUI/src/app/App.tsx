import { BrowserRouter } from 'react-router';
import AuthProvider from '../features/auth/AuthProvider.tsx';
import LanguageProvider from '../i18n/LanguageProvider.tsx';
import AppRoutes from './router.tsx';
import ScrollManager from './ScrollManager.tsx';

// Composition only: the router, the current language, the auth state, and the URL map.
export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
