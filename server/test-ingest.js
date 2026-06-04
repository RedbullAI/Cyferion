import { supabase } from './lib/supabase.js';

async function testIngestion() {
  console.log('Fetching a protected user to test with...');
  const { data: users, error: fetchErr } = await supabase
    .from('protected_users')
    .select('phone, name')
    .limit(1);

  if (fetchErr) {
    console.error('Error fetching user:', fetchErr);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No protected users found in the database. Please add a family member through the frontend first.');
    return;
  }

  const targetPhone = users[0].phone;
  const targetName = users[0].name;
  console.log(`Found user: ${targetName} (${targetPhone})`);

  console.log('\nSending test SMS payload to backend...');
  const payload = {
    sender: 'CP-SBIINF',
    message: 'URGENT: Your SBI account is blocked. Update KYC immediately at http://bit.ly/sbi-verify.',
    targetPhone: targetPhone
  };

  try {
    const response = await fetch('http://localhost:5000/api/ingest-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ End-to-end test successful! The message should now appear in your dashboard and a toast notification should have popped up if you had the dashboard open.');
    } else {
      console.log('\n❌ Test failed.');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testIngestion();
