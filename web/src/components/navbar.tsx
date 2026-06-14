'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Clock, ChevronDown, CloudSun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { WeatherWidget } from './weather-widget';

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const supabase = createClient();

  const [dbPrograms, setDbPrograms] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name_ar');
      if (data) setDbCategories(data);
    }
    async function fetchPrograms() {
      const { data } = await supabase
        .from('programs')
        .select('id, title')
        .order('created_at', { ascending: false });
      if (data) setDbPrograms(data);
    }
    fetchCategories();
    fetchPrograms();
  }, [supabase]);

  const rootCategories = (dbCategories.length > 0
    ? dbCategories.filter(c => !c.parent_id)
    : [
      { name_ar: 'سياسة', slug: 'politics', id: 'politics' },
      { name_ar: 'اقتصاد', slug: 'economy', id: 'economy' },
      { name_ar: 'رياضة', slug: 'sports', id: 'sports' },
      { name_ar: 'تكنولوجيا', slug: 'tech', id: 'tech' },
      { name_ar: 'ليبيا', slug: 'libya', id: 'libya' },
      { name_ar: 'منوعات', slug: 'miscellaneous', id: 'miscellaneous' },
    ]).filter(c => c.name_ar !== 'الوسائط' && c.name_ar !== 'وسائط' && c.slug !== 'media' && c.slug !== 'videos' && c.slug !== 'reels' && c.name_ar !== 'ريلز');

  const getSubcategories = (parentId: string) => {
    return dbCategories.filter(c => c.parent_id === parentId);
  };

  const getCategoryHref = (cat: any) => {
    if (cat.external_url) return cat.external_url;
    return `/category/${cat.slug || cat.name_ar}`;
  };

  const getCategoryTarget = (cat: any) => {
    return cat.external_url ? "_blank" : undefined;
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, ' / ');
  const weekday = currentDate.toLocaleDateString('ar-EG', { weekday: 'long' });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-50 w-full bg-[#03060a] relative" dir="rtl">

      {/* Background Image Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20">
        <Image
          src="/b6412343-aac5-4a41-96e8-4a0437ac8b18.jpg"
          alt="Menu Background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      <div className="relative z-10 w-full">
        {/* Top Bar */}
        <div className="border-b border-white/5 py-2 px-6 lg:px-12 flex justify-between items-center text-[11px] font-bold text-slate-300">

          {/* Right side in RTL (Live & Time) */}
          <div className="flex items-center gap-6 mr-4 md:mr-16 xl:mr-20">
            <Link href="/live" className="text-white hover:text-primary transition-all flex items-center gap-2 group border border-white/10 px-4 py-1.5 rounded-full bg-white/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-bold">بث مباشر</span>
            </Link>
            <div className="hidden md:flex items-center gap-4 text-[11px] font-bold pr-4 border-r border-white/10">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formattedTime}</span>
              <div className="w-px h-3 bg-white/20" />
              <span className="text-white">{weekday} <span className="text-slate-400">|</span> {formattedDate}</span>

              <div className="w-px h-3 bg-white/20" />
              {/* Weather Dropdown */}
              <div className="relative group/weather flex items-center h-full">
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer text-white">
                  <CloudSun className="w-4 h-4 text-orange-400" />
                  <span className="font-bold text-xs">29°</span>
                </button>

                {/* Weather Dropdown Content */}
                <div className="absolute top-full right-0 pt-4 opacity-0 invisible group-hover/weather:opacity-100 group-hover/weather:visible transition-all duration-300 z-[100] w-[340px] origin-top-right">
                  <WeatherWidget />
                </div>
              </div>
            </div>
          </div>

          {/* Left side in RTL (Social Media) */}
          <div className="flex items-center gap-4 text-slate-200">
            <Link href="https://www.facebook.com/profile.php?id=61590300562717" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="14px" width="14px" xmlns="http://www.w3.org/2000/svg"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path></svg></Link>
            <Link href="https://x.com/AlMadaJournal" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="14px" width="14px" xmlns="http://www.w3.org/2000/svg"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"></path></svg></Link>
            <Link href="https://www.youtube.com/@AlMadaJournal" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 576 512" height="14px" width="14px" xmlns="http://www.w3.org/2000/svg"><path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path></svg></Link>
            <Link href="https://www.instagram.com/almadajournal/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors"><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="14px" width="14px" xmlns="http://www.w3.org/2000/svg"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12.2 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path></svg></Link>

            <div className="flex flex-col items-center justify-center gap-0.5">
              <span className="font-semibold text-xs tracking-widest pl-2">AlMada</span>
              <Link href="/about" className="text-[9px] text-slate-400 hover:text-white transition-colors pl-2 font-bold whitespace-nowrap leading-none">
                About <span className="text-primary font-bold mx-0.5">|</span> نبذة
              </Link>
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <div className="px-6 lg:px-12 pt-5 pb-0 flex items-center justify-between border-b border-white/5">

          {/* Right: Logo */}
          <div className="flex flex-col items-center justify-center gap-1 md:gap-2 pb-5 pt-2 md:mr-2 xl:mr-2">
            <Link href="/" className="relative h-24 w-[180px] md:h-32 md:w-[260px] flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="صحيفة المدى"
                fill
                priority
                className="object-contain object-center scale-110 md:scale-125 origin-center"
              />
            </Link>
            <div className="h-[1.5px] w-[75px] md:w-[100px] bg-primary rounded-full opacity-80 mt-6 md:mt-8 mb-1.5"></div>
            <span className="text-slate-400 text-[8px] md:text-[9.5px] font-medium tracking-[0.2em] whitespace-nowrap">صحيفة إلكترونية مستقلة</span>
          </div>

          {/* Center: Links */}
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-8 xl:gap-10 pb-0 h-full self-end">
            <Link
              href="/"
              className={`font-black text-sm pb-5 border-b-2 transition-colors ${pathname === '/' ? 'text-primary border-primary' : 'text-white border-transparent hover:text-primary'}`}
            >
              الرئيسية
            </Link>
            {rootCategories.map((cat: any) => {
              const isCatActive = pathname === `/category/${cat.slug || cat.name_ar}` ||
                pathname === `/category/${encodeURIComponent(cat.slug || cat.name_ar)}`;
              const subCategories = getSubcategories(cat.id);
              const hasSub = subCategories.length > 0;
              return (
                <div key={cat.slug || cat.name_ar} className="relative group h-full flex items-center">
                  <Link
                    href={getCategoryHref(cat)}
                    target={getCategoryTarget(cat)}
                    className={`font-black text-sm pb-5 border-b-2 flex items-center gap-1.5 transition-colors ${isCatActive ? 'text-primary border-primary' : 'text-white border-transparent hover:text-primary'}`}
                  >
                    {cat.name_ar}
                    {hasSub && <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />}
                  </Link>

                  {hasSub && (
                    <div className="absolute top-full right-0 min-w-[180px] bg-[#03060a] border border-white/5 border-t-0 rounded-b-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50">
                      {subCategories.map((sub: any) => (
                        <Link
                          key={sub.id}
                          href={getCategoryHref(sub)}
                          target={getCategoryTarget(sub)}
                          className="px-5 py-2.5 text-sm text-slate-300 hover:text-primary hover:bg-white/5 transition-colors font-bold whitespace-nowrap text-right"
                        >
                          {sub.name_ar}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Hardcoded Media (الوسائط) dropdown */}
            <div className="relative group h-full flex items-center">
              <button
                className={`font-black text-sm pb-5 border-b-2 flex items-center gap-1.5 transition-colors ${pathname.startsWith('/videos') || pathname.startsWith('/podcasts') || pathname.startsWith('/reels')
                    ? 'text-primary border-primary'
                    : 'text-white border-transparent hover:text-primary'
                  }`}
              >
                الوسائط
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full right-0 min-w-[180px] bg-[#03060a] border border-white/5 border-t-0 rounded-b-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50">
                <Link
                  href="/videos"
                  className="px-5 py-2.5 text-sm text-slate-300 hover:text-primary hover:bg-white/5 transition-colors font-bold whitespace-nowrap text-right"
                >
                  تقارير
                </Link>
                <Link
                  href="/podcasts"
                  className="px-5 py-2.5 text-sm text-slate-300 hover:text-primary hover:bg-white/5 transition-colors font-bold whitespace-nowrap text-right"
                >
                  برودكست
                </Link>
                <Link
                  href="/reels"
                  className="px-5 py-2.5 text-sm text-slate-300 hover:text-primary hover:bg-white/5 transition-colors font-bold whitespace-nowrap text-right"
                >
                  ريلز
                </Link>
              </div>
            </div>

            {/* Hardcoded Programs (برامج) dropdown */}
            <div className="relative group h-full flex items-center">
              <Link
                href="/programs"
                className={`font-black text-sm pb-5 border-b-2 flex items-center gap-1.5 transition-colors ${pathname.startsWith('/programs')
                    ? 'text-primary border-primary'
                    : 'text-white border-transparent hover:text-primary'
                  }`}
              >
                برامج
                {dbPrograms.length > 0 && (
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-180" />
                )}
              </Link>

              {dbPrograms.length > 0 && (
                <div className="absolute top-full right-0 min-w-[200px] max-w-[300px] max-h-[300px] overflow-y-auto bg-[#03060a] border border-white/5 border-t-0 rounded-b-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col py-2 z-50 custom-scrollbar">
                  {dbPrograms.map((prog: any) => (
                    <Link
                      key={prog.id}
                      href={`/programs?id=${prog.id}`}
                      className="px-5 py-2.5 text-sm text-slate-300 hover:text-primary hover:bg-white/5 transition-colors font-bold truncate text-right block"
                      title={prog.title}
                    >
                      {prog.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Left: Empty for balance or mobile menu */}
          <div className="lg:hidden flex items-center pb-5">
            <button
              className="p-2 text-white hover:text-primary transition-all"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#03060a] border-t border-white/5 flex flex-col px-6 py-4 space-y-4 overflow-hidden"
            >
              <Link href="/" className="text-white font-black text-base pb-3 border-b border-white/5" onClick={() => setIsOpen(false)}>الرئيسية</Link>
              {rootCategories.map((cat: any) => {
                const subCategories = getSubcategories(cat.id);
                return (
                  <div key={cat.slug || cat.name_ar} className="flex flex-col pb-3 border-b border-white/5">
                    <Link
                      href={getCategoryHref(cat)}
                      target={getCategoryTarget(cat)}
                      className="text-white font-black text-base"
                      onClick={() => setIsOpen(false)}
                    >
                      {cat.name_ar}
                    </Link>
                    {subCategories.length > 0 && (
                      <div className="flex flex-col pt-3 pr-4 space-y-3">
                        {subCategories.map((sub: any) => (
                          <Link
                            key={sub.id}
                            href={getCategoryHref(sub)}
                            target={getCategoryTarget(sub)}
                            className="text-slate-400 hover:text-primary font-bold text-sm transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {sub.name_ar}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Hardcoded Media (الوسائط) dropdown in Mobile Menu */}
              <div className="flex flex-col pb-3 border-b border-white/5">
                <span className="text-white font-black text-base text-right">الوسائط</span>
                <div className="flex flex-col pt-3 pr-4 space-y-3">
                  <Link
                    href="/videos"
                    className="text-slate-400 hover:text-primary font-bold text-sm transition-colors text-right"
                    onClick={() => setIsOpen(false)}
                  >
                    تقارير
                  </Link>
                  <Link
                    href="/podcasts"
                    className="text-slate-400 hover:text-primary font-bold text-sm transition-colors text-right"
                    onClick={() => setIsOpen(false)}
                  >
                    برودكست
                  </Link>
                  <Link
                    href="/reels"
                    className="text-slate-400 hover:text-primary font-bold text-sm transition-colors text-right"
                    onClick={() => setIsOpen(false)}
                  >
                    ريلز
                  </Link>
                </div>
              </div>

              {/* Hardcoded Programs (برامج) dropdown in Mobile Menu */}
              <div className="flex flex-col pb-3 border-b border-white/5">
                <Link
                  href="/programs"
                  className="text-white font-black text-base text-right"
                  onClick={() => setIsOpen(false)}
                >
                  برامج
                </Link>
                {dbPrograms.length > 0 && (
                  <div className="flex flex-col pt-3 pr-4 space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {dbPrograms.map((prog: any) => (
                      <Link
                        key={prog.id}
                        href={`/programs?id=${prog.id}`}
                        className="text-slate-400 hover:text-primary font-bold text-sm transition-colors text-right truncate"
                        onClick={() => setIsOpen(false)}
                        title={prog.title}
                      >
                        {prog.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
