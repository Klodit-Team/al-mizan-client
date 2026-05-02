import React, { Suspense } from 'react';

// Force Next.js to skip static generation for auth pages
export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Wrap all auth pages in Suspense to satisfy useSearchParams()
  return <Suspense fallback={<div>Chargement...</div>}>{children}</Suspense>;
}
