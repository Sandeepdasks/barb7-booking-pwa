import { useCallback, useState } from "react";
// ASSUMPTION — not present in this sandbox. Verify these paths/shapes match
// your actual AuthProvider / useAuth / signInWithGoogle.
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../services/authService";
// ASSUMPTION — Firebase Auth instance, same file your config exports `db` from.
import { auth } from "../../lib/firebase";

export type AuthGateStatus = "idle" | "authenticating" | "error";

interface UseBookingAuthGateResult {
  status: AuthGateStatus;
  errorMessage: string | null;
  ensureAuthenticated: () => Promise<boolean>;
}

// ROOT CAUSE of Bug 4 ("closing the Google popup still lets booking continue"):
// the old gate returned `true` whenever `signInWithGoogle()` merely RESOLVED.
// If authService catches its own errors internally (logging and returning
// instead of rethrowing) — a very common pattern — then a cancelled popup
// resolves quietly and the gate reports success with no user signed in.
//
// Fix: never infer success from "it didn't throw". Verify an actual signed-in
// identity afterwards via auth.currentUser. The gate now only returns true
// when a real user exists, so a cancelled popup can never advance the flow.
export function useBookingAuthGate(): UseBookingAuthGateResult {
  const { user } = useAuth();
  const [status, setStatus] = useState<AuthGateStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ensureAuthenticated = useCallback(async (): Promise<boolean> => {
    if (user) return true;

    setStatus("authenticating");
    setErrorMessage(null);
    try {
      await authService.signInWithGoogle();

      // Authoritative check — not "did the promise resolve".
      if (!auth.currentUser) {
        setStatus("idle"); // treated as a cancel, not a failure
        return false;
      }

      setStatus("idle");
      return true;
    } catch (err) {
      const code = (err as { code?: string } | undefined)?.code ?? "unknown";

      // User-initiated / benign cancellations are not errors — reset quietly
      // and leave Continue available for retry.
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        setStatus("idle");
        return false;
      }

      // Popup blocked by the browser: actionable, so tell the user plainly.
      if (code === "auth/popup-blocked") {
        console.error("Google sign-in popup blocked:", err);
        setStatus("error");
        setErrorMessage(
          "Your browser blocked the sign-in popup. Allow popups for this site and try again."
        );
        return false;
      }

      // Never swallow real errors — log full detail, surface the code in dev.
      // Common ones: auth/unauthorized-domain (add the origin under Firebase
      // Console -> Authentication -> Settings -> Authorized domains),
      // auth/network-request-failed (connectivity or missing config).
      console.error("Google sign-in failed:", code, err);
      setStatus("error");
      setErrorMessage(
        import.meta.env.DEV
          ? `Sign-in failed: ${code}`
          : "Sign-in failed. Please try again."
      );
      return false;
    }
  }, [user]);

  return { status, errorMessage, ensureAuthenticated };
}