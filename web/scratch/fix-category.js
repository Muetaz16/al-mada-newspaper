const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixCategory() {
  const { data: existing, error: fetchErr } = await supabase
    .from('categories')
    .select('*')
    .or('slug.eq.analyses,name_ar.eq.أبعد مدى')
    .maybeSingle();

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
  }

  if (existing) {
    console.log('Category exists. Updating slug to analyses to be sure.');
    const { error: upErr } = await supabase
      .from('categories')
      .update({ slug: 'analyses' })
      .eq('id', existing.id);
    if (upErr) console.error('Update error:', upErr);
    else console.log('Updated successfully');
  } else {
    console.log('Category not found. Creating it.');
    const { data: inserted, error: insErr } = await supabase
      .from('categories')
      .insert({ name_ar: 'أبعد مدى', slug: 'analyses' })
      .select();
    if (insErr) console.error('Insert error:', insErr);
    else console.log('Created successfully:', inserted);
  }
}

fixCategory();
