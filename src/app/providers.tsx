'use client';

import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Import Bootstrap JavaScript
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return <>{children}</>;
}