interface Props {
  onClick: () => void;
  loading: boolean;
}

/** Presentational only — no auth logic. Click handler comes from the page. */
export function GoogleSignInButton({ onClick, loading }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-lg border border-gray-300 py-2.5 px-4 flex items-center justify-center gap-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      {loading ? 'Signing in…' : 'Continue with Google'}
    </button>
  );
}
