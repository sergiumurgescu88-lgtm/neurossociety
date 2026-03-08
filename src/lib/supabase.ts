import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lgrllhsfgvnngtmlwwug.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncmxsaHNmZ3Zubmd0bWx3d3VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTUzODYsImV4cCI6MjA4NzE3MTM4Nn0.AjMKEgpBwoFXm09aGT9BOCNfrBJJPVx1Ii7ev8ZINg4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
