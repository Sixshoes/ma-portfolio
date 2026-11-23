import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: '著作管理後台 | Prof. Yuan-Ron Ma',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ colorScheme: 'dark' }} className="min-h-screen bg-[#121110] text-stone-200">
      {children}
    </div>
  );
}
