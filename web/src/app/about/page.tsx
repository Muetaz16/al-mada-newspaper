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
              <div className="space-y-6 text-gray-300 leading-relaxed text-lg md:text-xl font-almarai">
                <p>
                  صحيفة المدى صحيفة ليبية إلكترونية مستقلة تُعنى بالشأن الليبي، وتلتزم بتقديم الخبر وتحليله ومتابعة امتداداته، انطلاقًا من إيمانها بأن الصحافة ليست مجرد نقلٍ للأحداث، بل أداة لفهمها واستجلاء أبعادها وتأثيراتها.
                </p>
                <p>
                  تتبنى «المدى» نهجًا مهنيًا يقوم على الدقة والموضوعية والعمق، وتسعى إلى تقديم محتوى صحفي موثوق يجمع بين الخبر والتحليل والتحقيق والمتابعة والتفسير، بما يمنح القارئ رؤيةً أشمل للواقع وتطوراته.
                </p>
                <p>
                  وتستلهم الصحيفة رسالتها من شعارها: «المدى.. للخبر امتداد»، إيمانًا بأن وراء كل خبر قصة، وخلف كل حدث معنى، وأن الصحافة الجادة تبدأ من الخبر ولا تتوقف عنده.
                </p>
                <p className="font-semibold text-white pt-2">
                  فمرحبًا بكم في فضاء «المدى»...
                  <br />
                  <span className="text-[#dfa928]">حيث يبدأ الخبر ولا تنتهي الحكاية.</span>
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
                  Al-Mada is an independent Libyan online newspaper dedicated to covering Libyan affairs. Guided by the principles of accuracy, objectivity, and depth, it is committed to delivering the news, analyzing developments, and following the stories beyond the headline.
                </p>
                <p>
                  Al-Mada believes that journalism is more than reporting events; it is about understanding their context, exploring their implications, and helping readers make sense of a rapidly changing world. Through news reporting, analysis, investigative journalism, interpretation, and continuous coverage, the newspaper strives to provide reliable and meaningful journalism that offers a deeper perspective on Libya and its evolving realities.
                </p>
                <p>
                  Inspired by its motto, "Beyond the Headline," Al-Mada is founded on the belief that every news story has a wider context, every event carries a deeper meaning, and that serious journalism begins with the news but does not end there.
                </p>
                <p className="font-medium text-white pt-2">
                  Welcome to Al-Mada.
                  <br />
                  <span className="text-[#dfa928]">Where the News Begins, and the Story Never Ends.</span>
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
