import { useAuth } from '@/contexts/AuthContext';
import { GoogleSignInButton } from '@/features/auth/components/GoogleSignInButton';
import { AuthErrorMessage } from '@/features/auth/components/AuthErrorMessage';

export function CustomerLoginPage() {
  const { user, loading, error, signInWithGoogle, signOutUser } = useAuth();

  if (user && user.role === 'customer') {
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
      <h1 className="text-xl font-semibold text-center">Sign in to book</h1>
      {error && <AuthErrorMessage message={error} />}
      <GoogleSignInButton onClick={signInWithGoogle} loading={loading} />
    </div>
  );
}
