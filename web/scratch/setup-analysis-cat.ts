import { createClient } from '../src/utils/supabase/client';

async function ensureAnalysisCategory() {
  const supabase = createClient();
  
  // 1. Check if exists
  const { data: existing } = await supabase
    .from('categories')
    .select('*')
    .eq('name_ar', 'أبعد مدى')
    .maybeSingle();
    
  if (existing) {
    console.log('CATEGORY_ID:', existing.id);
    return;
  }
  
  // 2. Create if missing
  const { data: created, error } = await supabase
    .from('categories')
    .insert({
      name_ar: 'أبعد مدى',
      slug: 'analyses',
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating category:', error);
  } else {
    console.log('CATEGORY_ID:', created.id);
  }
}

ensureAnalysisCategory();
