const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  console.log('Checking for "news-images" bucket...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError.message);
    return;
  }

  const exists = buckets.find(b => b.name === 'news-images');

  if (!exists) {
    console.log('Creating "news-images" bucket...');
    const { error: createError } = await supabase.storage.createBucket('news-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (createError) {
      console.error('Error creating bucket:', createError.message);
      console.log('\nIMPORTANT: Please create the bucket manually in the Supabase Dashboard:');
      console.log('1. Go to Storage');
      console.log('2. Click "New Bucket"');
      console.log('3. Name it "news-images"');
      console.log('4. Toggle it to "Public"');
    } else {
      console.log('Success! Bucket "news-images" created and set to Public.');
    }
  } else {
    console.log('Bucket "news-images" already exists.');
  }
}

setupStorage();
