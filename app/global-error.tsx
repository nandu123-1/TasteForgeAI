"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="error-page">
          <div className="error-card">
            <span className="eyebrow">TASTEFORGE AI</span>
            <h1>We lost the signal.</h1>
            <p>Reload the experience to reconnect your food intelligence layer.</p>
            <button className="primary-btn" type="button" onClick={reset}>
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
