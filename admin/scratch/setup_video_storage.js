const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log('Updating "videos" bucket to be PUBLIC...');
  
  // Try to update existing bucket first
  const { error: updateError } = await supabase.storage.updateBucket('videos', {
    public: true
  });

  if (updateError) {
    if (updateError.message.includes('not found')) {
      console.log('Bucket "videos" not found, creating it...');
      const { error: createError } = await supabase.storage.createBucket('videos', {
        public: true
      });
      if (createError) console.error('Create error:', createError.message);
      else console.log('Bucket "videos" created successfully.');
    } else {
      console.error('Update error:', updateError.message);
    }
  } else {
    console.log('Bucket "videos" is now Public.');
  }

  console.log('\n--- IMPORTANT ---');
  console.log('If the videos still do not show, please run this SQL in your Supabase Dashboard:');
  console.log("CREATE POLICY \"Public Access\" ON storage.objects FOR SELECT USING (bucket_id = 'videos');");
}

setup();
