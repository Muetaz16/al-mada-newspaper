import { createClient } from './src/utils/supabase/server';

async function testFetch() {
  const supabase = await createClient();
  const { data: news, error } = await supabase
    .from('news')
    .select('*, category:categories(name_ar, slug)')
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false });

  console.log('Error:', error);
  console.log('News length:', news?.length);
  if (news && news.length > 0) {
    console.log('First item:', JSON.stringify(news[0].category, null, 2));
  }
}

testFetch();
