"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="error-page">
      <div className="error-card">
        <span className="eyebrow">KITCHEN ERROR</span>
        <h1>Something did not plate correctly.</h1>
        <p>Your saved preferences are untouched. Try this screen again.</p>
        <button className="primary-btn" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
