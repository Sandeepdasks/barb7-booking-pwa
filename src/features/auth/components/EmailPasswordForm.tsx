import { useState, type FormEvent } from 'react';

interface Props {
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
  submitLabel: string;
}

/** Presentational form only — validation is minimal (required fields);
 * authoritative checks happen in Firebase Auth itself. */
export function EmailPasswordForm({ onSubmit, loading, submitLabel }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(email.trim(), password);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-900"
          autoComplete="current-password"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand text-white py-2.5 font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in…' : submitLabel}
      </button>
    </form>
  );
}
