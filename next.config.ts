import type { NextConfig } from "next";

/**
 * Security/privacy headers enforce the product's central promise: photos never
 * leave the device. The CSP forbids any outbound connection except to our own
 * origin, so even an accidental future dependency cannot exfiltrate image data.
 * `connect-src 'self'` blocks fetch/XHR/WebSocket to third parties.
 */
const csp = [
  "default-src 'self'",
  "img-src 'self' blob: data:",
  // Next.js dev needs 'unsafe-eval'; tighten in production builds if desired.
  "script-src 'self' 'unsafe-inline'" +
    (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "no-referrer" },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), camera=(), microphone=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
