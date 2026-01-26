#!/usr/bin/env node
/*
 * scripts/test-acuity-key.js
 * Small utility to validate an Acuity API key (App Password) by calling
 * GET https://acuityscheduling.com/api/v1/me using HTTP Basic auth.
 *
 * Usage:
 *   node scripts/test-acuity-key.js
 *
 * The script will try to load `.env.local` from the project root if present
 * and will read the `ACUITY_APPPASSWORD` (or `ACUITY_API_KEY`) env var.
 */

const fs = require('fs');
const path = require('path');

function loadDotEnv(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const raw = fs.readFileSync(filePath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      if (!(key in process.env)) process.env[key] = val;
    });
  } catch (err) {
    // ignore
  }
}

// Ensure .env.local from repo root is loaded (useful for local testing)
loadDotEnv(path.resolve(process.cwd(), '.env.local'));

const key = process.env.ACUITY_APPPASSWORD || process.env.ACUITY_API_KEY || process.env.ACUITY_KEY;
const owner = process.env.ACUITY_ACCOUNTID || process.env.NEXT_PUBLIC_ACUITY_OWNER_ID || process.env.ACUITY_OWNER_ID;

if (!key) {
  console.error('No Acuity API key found. Set ACUITY_APPPASSWORD in environment or .env.local');
  process.exit(2);
}

const baseUrl = 'https://acuityscheduling.com/api/v1';
const url = `${baseUrl}/me`;

// Minimal fetch polyfill for Node <18 if global fetch not available
const fetchImpl = (typeof fetch !== 'undefined')
  ? fetch
  : ((url, opts = {}) => new Promise((resolve, reject) => {
    const https = require('https');
    const u = new URL(url);
    const options = {
      method: opts.method || 'GET',
      headers: opts.headers || {},
    };
    const req = https.request(u, options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          text: async () => data,
          json: async () => {
            try { return JSON.parse(data); } catch { return data; }
          }
        });
      });
    });
    req.on('error', (e) => reject(e));
    if (opts.body) req.write(opts.body);
    req.end();
  }));

(async () => {
  const auth = Buffer.from(`${key}:`).toString('base64');
  try {
    const res = await fetchImpl(url, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
      method: 'GET',
    });

    const bodyText = await res.text();

    if (res.ok) {
      console.log('SUCCESS: Acuity API key is valid.');
      try {
        const json = JSON.parse(bodyText);
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log(bodyText);
      }
      process.exit(0);
    }

    if (res.status === 401) {
      console.error('INVALID: Unauthorized (401) — API key is invalid or not authorized.');
      console.error(bodyText);
      process.exit(3);
    }

    console.error(`ERROR: Received ${res.status} ${res.statusText}`);
    console.error(bodyText);
    process.exit(4);

  } catch (err) {
    console.error('Network or fetch error:', err.message || err);
    process.exit(5);
  }
})();
