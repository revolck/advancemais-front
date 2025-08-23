"use client";

import Script from "next/script";

export default function ApiDocsPage() {
  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"
        strategy="afterInteractive"
        onReady={() => {
          (window as any).Redoc.init(
            "https://advancemais-api-7h1q.onrender.com/openapi.json",
            {},
            document.getElementById("redoc-container") as HTMLElement,
          );
        }}
      />
      <div id="redoc-container" className="min-h-screen" />
    </>
  );
}
