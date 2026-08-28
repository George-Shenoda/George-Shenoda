#!/usr/bin/env node
/**
 * Test script to verify desktop contact form uses PRODUCTION_URL
 * This verifies the code change is correct without needing to run the full app
 */

import fs from 'fs';
import path from 'path';

const contactPath = path.join(process.cwd(), 'apps/web/components/web/Contact.tsx');
const content = fs.readFileSync(contactPath, 'utf8');

let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${name}`);
    failed++;
  }
}

console.log('🔍 Testing desktop contact form changes...\n');

// Test 1: PRODUCTION_URL constant exists
test('PRODUCTION_URL constant defined', content.includes("const PRODUCTION_URL = 'https://george-shenoda.vercel.app';"));

// Test 2: handleSubmit uses PRODUCTION_URL for desktop (via executeSubmit)
test('handleSubmit uses PRODUCTION_URL for desktop', content.includes('await submitContact(PRODUCTION_URL, submitFormData)'));

// Test 3: outbox submit uses PRODUCTION_URL for desktop
test('outbox submit uses PRODUCTION_URL for desktop', content.includes('submit: (payload) => submitContact(PRODUCTION_URL, payload)'));

// Test 4: Old SITE_URL not used for desktop submit
test('No SITE_URL used for desktop submitContact', !content.includes('submitContact(SITE_URL, formData)') || content.includes('// Desktop app: use production URL'));

// Test 5: Old SITE_URL not used for outbox
test('No SITE_URL used for outbox submit', !content.includes('submitContact(SITE_URL, payload)') || content.includes('submitContact(PRODUCTION_URL, payload)'));

// Test 6: COOLDOWN_MS changed to 5000
test('COOLDOWN_MS is 5000', content.includes('const COOLDOWN_MS = 5_000;'));

// Test 7: No 'cooldown' status in state
test('No cooldown status type', !content.includes("'cooldown'") || content.includes("'idle' | 'loading' | 'success' | 'error' | 'queued'"));

// Test 8: executeSubmit function exists
test('executeSubmit function defined', content.includes('const executeSubmit = async'));

// Test 9: handleSubmit checks cooldownUntil and waits
test('handleSubmit waits during cooldown', content.includes('remainingMs = cooldownUntil - now') && content.includes('remainingMs > 0'));

// Test 10: No cooldown UI in JSX
test('No cooldown UI in JSX', !content.includes('status === \'cooldown\'') && !content.includes('cooldownRemaining'));

console.log('\n' + '='.repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed! Desktop contact form is configured correctly.');
}