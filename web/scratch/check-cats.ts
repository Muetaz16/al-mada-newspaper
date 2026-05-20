import { createClient } from '../src/utils/supabase/client';

async function checkCategories() {
  const supabase = createClient();
  const { data } = await supabase.from('categories').select('*');
  console.log(data);
}

checkCategories();
