import { useAuth } from '@/contexts/AuthContext';
import { EmailPasswordForm } from '@/features/auth/components/EmailPasswordForm';
import { AuthErrorMessage } from '@/features/auth/components/AuthErrorMessage';

export function AdminLoginPage() {
  const { user, loading, error, signInWithEmailPassword, signOutUser } = useAuth();

  if (user && user.role === 'admin') {
    return (
      <div className="max-w-sm mx-auto mt-16 text-center space-y-4">
        <p>Signed in as {user.name || user.email}.</p>
        <button onClick={signOutUser} className="text-sm underline">
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-4">
      <h1 className="text-xl font-semibold text-center">Admin Login</h1>
      {error && <AuthErrorMessage message={error} />}
      <EmailPasswordForm onSubmit={signInWithEmailPassword} loading={loading} submitLabel="Sign in" />
    </div>
  );
}
