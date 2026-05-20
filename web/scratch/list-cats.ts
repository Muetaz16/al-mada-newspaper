import { createClient } from '../src/utils/supabase/client';

async function listCats() {
  const supabase = createClient();
  const { data } = await supabase.from('categories').select('*');
  console.log('CATEGORIES:', data);
}

listCats();
