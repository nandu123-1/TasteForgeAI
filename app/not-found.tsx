"use client";

/* eslint-disable @next/next/no-html-link-for-pages */

export default function NotFound() {
  return (
    <main className="error-page">
      <div className="error-card">
        <span className="eyebrow">404 · LOST PLATE</span>
        <h1>This route is not on the menu.</h1>
        <p>The page may have moved, but your Taste DNA is still safe.</p>
        <a className="primary-btn" href="/dashboard">
          Back to TasteForge
        </a>
      </div>
    </main>
  );
}
