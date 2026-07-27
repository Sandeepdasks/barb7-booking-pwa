import AppRouter from '@/app/router';
import { AuthProvider } from '@/contexts/AuthContext';
// import { ThemeProvider } from '@/contexts/ThemeContext';

// ThemeProvider left commented — not part of the Authentication module.
export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
