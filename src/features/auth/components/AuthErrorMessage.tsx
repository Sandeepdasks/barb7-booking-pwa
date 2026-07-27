export function AuthErrorMessage({ message }: { message: string }) {
  return (
    <p role="alert" className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 rounded-md px-3 py-2">
      {message}
    </p>
  );
}
