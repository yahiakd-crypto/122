'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// We must dynamically import the Strategy Canvas because React Flow requires the window object
// and Next.js does Server-Side Rendering by default.
const StrategyCanvas = dynamic(() => import('@/components/StrategyCanvas'), { 
    ssr: false,
    loading: () => (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading Strategy Board...</p>
            </div>
        </div>
    )
});

export default function BoardPage() {
  return (
    <main className="w-full h-screen overflow-hidden flex flex-col relative">
        <div className="absolute top-4 left-4 z-50">
            <Link 
                href="/" 
                className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={16} />
                Back to Dashboard
            </Link>
        </div>
        <StrategyCanvas />
    </main>
  );
}
