import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOwnerAuth } from '@/contexts/OwnerAuthContext';
import { OwnerButton } from '@/components/owner/ui';

export function OwnerLoginPage() {
  const { signIn, error } = useOwnerAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSignIn() {
    setLoading(true);
    try {
      await signIn();
      navigate('/owner.html', { replace: true });
    } catch {
      // error surfaced via useOwnerAuth().error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0D12] px-6 font-['Inter',system-ui,sans-serif] text-[#F5F5F5]">
      <div className="mb-2 text-[28px] font-bold tracking-wide text-[#C8A06B]">BARB7</div>
      <div className="mb-8 text-[11px] tracking-[0.3em] text-[#6E7482]">UNISEX SALON</div>

      <h1 className="text-[20px] font-semibold">Owner Login</h1>
      <p className="mt-1 text-[14px] text-[#A7AAB4]">Access your dashboard</p>

      <OwnerButton
        variant="secondary"
        fullWidth
        loading={loading}
        onClick={handleSignIn}
        className="mt-8 flex items-center justify-center gap-3"
      >
        <GoogleIcon />
        Sign in with Google
      </OwnerButton>

      {error && <p className="mt-4 max-w-xs text-center text-[13px] text-[#E5484D]">{error}</p>}

      <p className="mt-8 flex items-center gap-1.5 text-[12px] text-[#6E7482]">
        🔒 Secure login for BARB7 owners
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2C29.3 35.4 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.9 36.3 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
