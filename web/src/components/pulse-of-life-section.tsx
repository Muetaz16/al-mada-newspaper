import { useState, useEffect } from 'react';
import { Heart, MessageCircleQuestion, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export function PulseOfLifeSection() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('pulse_of_life')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);
      if (data) setItems(data);
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) return null;

  const isMarquee = items.length > 3;
  // Double the items to make the horizontal scrolling marquee loop infinitely and seamlessly
  const marqueeItems = [...items, ...items];

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-6 border-b border-white/10 pb-6">
        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter bg-[#1c2e4e] border border-white/5 px-6 py-2 rounded-2xl shadow-xl">
          نبض الحياة
        </h3>
        <p className="text-white/60 font-bold text-lg hidden md:block">سؤال وجواب عن جمال وصحة</p>
      </div>

      {isMarquee ? (
        /* Cinematic Infinite Sliding Marquee (More than 3 items) */
        <div className="relative w-full overflow-hidden py-6" dir="ltr">
          {/* Elegant fading overlays on the edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#142038] via-[#142038]/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#142038] via-[#142038]/80 to-transparent z-10 pointer-events-none" />

          {/* Scrolling track */}
          <div className="flex gap-8 animate-marquee-slide">
            {marqueeItems.map((item, idx) => (
              <div 
                key={`${item.id}-${idx}`} 
                dir="rtl"
                className="w-[360px] shrink-0 bg-[#1c2e4e] p-8 rounded-[3.5rem] border border-white/5 shadow-2xl select-none pointer-events-none text-start space-y-6"
              >
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'}
                    alt={item.question}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-6 right-6">
                     <div className="bg-[#142038]/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl text-primary border border-white/10">
                        <Heart className="w-5 h-5 fill-primary" />
                     </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-wider">
                    <span className="bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                      {item.category || 'عام'}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-white leading-snug tracking-tight line-clamp-3">
                    {item.question}
                  </h4>
                </div>
              </div>
            ))}
          </div>

          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee-slide {
              display: flex;
              width: max-content;
              animation: marquee 35s linear infinite;
            }
          `}</style>
        </div>
      ) : (
        /* Standard Static Grid (3 or fewer items) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {items.map((item) => (
            <div key={item.id} className="group block space-y-6 bg-[#1c2e4e] p-10 rounded-[4rem] border border-white/5 shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:ring-primary/20">
              <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl pointer-events-none">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'}
                  alt={item.question}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute top-8 right-8">
                   <div className="bg-[#142038]/95 backdrop-blur-xl p-4 rounded-[1.5rem] shadow-2xl text-primary border border-white/10">
                      <Heart className="w-6 h-6 fill-primary" />
                   </div>
                </div>
              </div>
              
              <Link href={`/pulse-of-life/${item.id}`} className="block space-y-5 text-start cursor-pointer group/link">
                <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                  <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                    <MessageCircleQuestion className="w-4 h-4" />
                  </div>
                  {item.category || 'عام'}
                </div>
                <h4 className="text-3xl font-black text-white leading-tight group-hover/link:text-primary transition-all duration-300 tracking-tighter">
                  {item.question}
                </h4>
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
