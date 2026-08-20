// Supabase client — shared across all pages
// Loaded via CDN in each HTML page before this script runs

const SUPABASE_URL = 'https://mvezpxrditktrniizaze.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12ZXpweHJkaXRrdHJuaWl6YXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNDQ5MTgsImV4cCI6MjEwMjcyMDkxOH0.wu31it1IxNDUg5IXPudxriuO8Rsll5JCTPFqqtbHtS0';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
