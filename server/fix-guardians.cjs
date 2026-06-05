require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixGuardians() {
  console.log('Fetching auth users...');
  const { data: { users }, error: authErr } = await supabase.auth.admin.listUsers();
  
  if (authErr) {
    console.error('Error fetching users:', authErr);
    return;
  }

  console.log(`Found ${users.length} users. Checking guardians table...`);

  for (const u of users) {
    const { data: existing } = await supabase.from('guardians').select('id').eq('id', u.id).single();
    
    if (!existing) {
      console.log(`Creating guardian profile for ${u.email}...`);
      const meta = u.user_metadata || {};
      const name = meta.full_name || meta.name || u.email.split('@')[0];
      
      const { error: insertErr } = await supabase.from('guardians').insert({
        id: u.id,
        email: u.email,
        name: name,
        phone: meta.phone || ''
      });
      
      if (insertErr) console.error(`Failed to insert ${u.email}:`, insertErr.message);
      else console.log(`✅ Success: ${u.email}`);
    } else {
      console.log(`Profile already exists for ${u.email}`);
    }
  }
  console.log('Done!');
}

fixGuardians();
