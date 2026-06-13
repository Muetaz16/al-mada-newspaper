'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { BreakingNewsTicker } from '@/components/breaking-news';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#142038] text-white flex flex-col font-sans">
      <Navbar />
      <BreakingNewsTicker />

      {/* Empty Main Content Area */}
      <main className="flex-grow container mx-auto px-6 py-16 md:py-24 max-w-5xl" dir="rtl">
        {/* Empty page content */}
      </main>

      <Footer />
    </div>
  );
}
