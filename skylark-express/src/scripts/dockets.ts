// Docket / AWB validation shared by every tracking entry point.
export type DocketCheck = { ok: true; numbers: string[] } | { ok: false; message: string };
export function validateDockets(raw: string): DocketCheck {
  const parts = raw.split(/[\s,;]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
  if (!parts.length) return { ok: false, message: 'Enter a docket or AWB number to track.' };
  if (parts.length > 5) return { ok: false, message: 'You can track up to five numbers at a time.' };
  const bad = parts.find((p) => !/^[A-Z0-9][A-Z0-9\-\/]{4,23}$/.test(p));
  if (bad) return { ok: false, message: `“${bad.slice(0, 24)}” does not look like a docket or AWB number. Use 5 to 24 letters and digits, as printed on your consignment note.` };
  return { ok: true, numbers: [...new Set(parts)] };
}
