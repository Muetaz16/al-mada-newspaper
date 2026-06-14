import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const categories = [
  { name_ar: 'سياسة', slug: 'politics', sort_order: 1 },
  { name_ar: 'اقتصاد', slug: 'economy', sort_order: 2 },
  { name_ar: 'رياضة', slug: 'sports', sort_order: 3 },
  { name_ar: 'تكنولوجيا', slug: 'tech', sort_order: 4 },
  { name_ar: 'ليبيا', slug: 'libya', sort_order: 5 },
  { name_ar: 'منوعات', slug: 'miscellaneous', sort_order: 6 },
];

async function seed() {
  console.log('Seeding categories...');
  
  for (const cat of categories) {
    // Check if exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', cat.slug)
      .single();
      
    if (!existing) {
      const { error } = await supabase.from('categories').insert([cat]);
      if (error) {
        console.error(`Failed to insert ${cat.name_ar}:`, error.message);
      } else {
        console.log(`Inserted: ${cat.name_ar}`);
      }
    } else {
      console.log(`Already exists: ${cat.name_ar}`);
    }
  }
  
  console.log('Done seeding.');
}

seed();
