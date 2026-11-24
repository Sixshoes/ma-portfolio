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
    <div style={{ colorScheme: 'light' }} className="min-h-screen bg-[#F6F7F8] text-[#2B3642]">
      {children}
    </div>
  );
}
