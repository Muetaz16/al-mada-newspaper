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
      <main className="flex-grow container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-6xl" dir="rtl">
        <div className="bg-[#1a2845]/80 backdrop-blur-md border border-[#2a3f6a] rounded-3xl p-8 md:p-16 shadow-2xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#dfa928]/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#dfa928]/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-12 md:gap-0 items-stretch justify-between">
            {/* Arabic Side (Right) */}
            <div className="flex-1 w-full text-right md:border-l border-[#2a3f6a]/50 md:pl-12" dir="rtl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
                نبذة <span className="text-[#dfa928]">عنا</span>
              </h1>
              <div className="space-y-6 text-gray-300 leading-relaxed text-lg md:text-xl">
                <p>
                  صحيفة المدى هي منصة إخبارية متكاملة تأخذك إلى أبعد مدى في عالم الخبر والتحليل والمعرفة. نقدم تغطية شاملة وحصرية على مدار الساعة بأحدث التقنيات الرقمية.
                </p>
                <p>
                  نسعى دائمًا لتقديم المحتوى الأكثر دقة وموثوقية لقرائنا، معتمدين على فريق من أفضل الصحفيين والمحللين لتزويدكم بالصورة الكاملة لكل حدث.
                </p>
                <p>
                  تجمع منصتنا بين الأصالة في نقل الخبر والمعاصرة في التقديم التقني، لنوفر تجربة مستخدم استثنائية تواكب تطلعات القارئ العربي في كل مكان.
                </p>
              </div>
            </div>

            {/* English Side (Left) */}
            <div className="flex-1 w-full text-left md:pr-12 mt-8 md:mt-0" dir="ltr">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-wide">
                About <span className="text-[#dfa928]">Us</span>
              </h1>
              <div className="space-y-6 text-gray-300 leading-relaxed text-lg md:text-xl font-light">
                <p>
                  Al-Mada Newspaper is an integrated news platform that takes you further into the world of news, analysis, and knowledge. We provide comprehensive and exclusive coverage around the clock using the latest digital technologies.
                </p>
                <p>
                  We always strive to provide the most accurate and reliable content to our readers, relying on a team of top journalists and analysts to give you the complete picture of every event.
                </p>
                <p>
                  Our platform combines authenticity in reporting with modernity in technical presentation, providing an exceptional user experience that meets the aspirations of readers everywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
