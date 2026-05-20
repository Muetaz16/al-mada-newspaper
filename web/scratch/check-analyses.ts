import { createClient } from '../src/utils/supabase/client';

async function checkAnalyses() {
  const supabase = createClient();
  const { data: cats } = await supabase.from('categories').select('*').eq('name_ar', 'أبعد مدى');
  console.log('Category "أبعد مدى":', cats);
}

checkAnalyses();
