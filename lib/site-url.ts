/** Canonical site URL — Vercel in production, falling back to primary Vercel preview domain. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, '');
  }
  const prodHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prodHost) {
    return `https://${prodHost.replace(/^https?:\/\//i, '').replace(/\/+$/, '')}`;
  }
  const previewHost = process.env.VERCEL_URL?.trim();
  if (previewHost) {
    return `https://${previewHost.replace(/^https?:\/\//i, '').replace(/\/+$/, '')}`;
  }
  return 'https://ma-portfolio-alpha.vercel.app';
}
