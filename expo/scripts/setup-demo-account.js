#!/usr/bin/env node
/**
 * setup-demo-account.js
 *
 * Creates (or resets) the App Store / Play Store demo account in Supabase.
 * Run once before submitting for review:
 *
 *   node scripts/setup-demo-account.js
 *
 * Requires EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_EMAIL = process.env.EXPO_PUBLIC_DEMO_EMAIL ?? 'demo@purrly.app';
const DEMO_PASSWORD = process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? 'Demo1234!';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n🐈 Setting up demo account: ${DEMO_EMAIL}\n`);

  // 1. Try to create the user
  const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true, // skip email confirmation
  });

  let userId;

  if (signUpError) {
    if (signUpError.message.includes('already been registered') || signUpError.message.includes('already exists')) {
      console.log('ℹ️  User already exists — resetting password and profile...');
      // Fetch existing user
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email === DEMO_EMAIL);
      if (!existing) {
        console.error('❌ Could not find existing demo user');
        process.exit(1);
      }
      userId = existing.id;
      // Reset password
      await supabase.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD });
    } else {
      console.error('❌ Failed to create user:', signUpError.message);
      process.exit(1);
    }
  } else {
    userId = signUpData.user.id;
    console.log(`✅ User created: ${userId}`);
  }

  // 2. Upsert profile with Premium tier
  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email: DEMO_EMAIL,
      name: 'Demo Account',
      subscription_tier: 'premium',
      subscription_expiry: '2126-01-01T00:00:00Z',
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    console.error('❌ Failed to upsert profile:', profileError.message);
    process.exit(1);
  }

  console.log('✅ Profile set to Premium tier');
  console.log('\n📱 Demo account ready for App Review:');
  console.log(`   Email    : ${DEMO_EMAIL}`);
  console.log(`   Password : ${DEMO_PASSWORD}`);
  console.log(`   Plan     : Premium\n`);
}

main().catch((e) => {
  console.error('❌ Unexpected error:', e);
  process.exit(1);
});
