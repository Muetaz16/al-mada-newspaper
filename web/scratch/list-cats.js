const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function listCats() {
  const { data } = await supabase.from('categories').select('*');
  console.log('CATEGORIES:', JSON.stringify(data, null, 2));
}

listCats();
