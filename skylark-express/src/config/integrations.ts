// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER INTEGRATIONS — each tool is configured independently.
// Set the PUBLIC_* variables at build time (see .env.example). With no endpoint,
// each tool falls back to the central phone/email route and says so on screen.
//   mode 'live'    → calls the operator-supplied production endpoint
//   mode 'test'    → calls the local mock API in server/preview.mjs (preview only, labelled on screen)
//   mode 'offline' → no endpoint; human fallback (email draft / phone)
// ─────────────────────────────────────────────────────────────────────────────
const env = import.meta.env;
type Mode = 'live' | 'test' | 'offline';
const pick = (endpoint: string | undefined, testPath: string): { mode: Mode; endpoint: string } => {
  if (endpoint) return { mode: 'live', endpoint };
  if (env.PUBLIC_SITE_MODE === 'preview') return { mode: 'test', endpoint: testPath };
  return { mode: 'offline', endpoint: '' };
};
export const integrations = {
  siteMode: (env.PUBLIC_SITE_MODE as string) || 'production',
  tracking: pick(env.PUBLIC_TRACKING_ENDPOINT, '/api/test/track'),
  pod: pick(env.PUBLIC_POD_ENDPOINT, '/api/test/pod'),
  pin: pick(env.PUBLIC_PIN_ENDPOINT, '/api/test/pin'),
  forms: pick(env.PUBLIC_FORMS_ENDPOINT, '/api/test/enquiry'),
  /** Approved customer portal link, when the operator has one. */
  customerLogin: { url: (env.PUBLIC_CUSTOMER_PORTAL_URL as string) || '' },
  /** Careers applications use the published mailbox until an approved upload backend exists. */
  careersUpload: { endpoint: (env.PUBLIC_CAREERS_UPLOAD_ENDPOINT as string) || '' },
};
export type Integrations = typeof integrations;
