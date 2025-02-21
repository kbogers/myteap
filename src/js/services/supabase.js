import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://hsjgwfeypiexvzbaqlem.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhzamd3ZmV5cGlleHZ6YmFxbGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwODAzNjYsImV4cCI6MjA1NTY1NjM2Nn0.DrMw71Y8gxxcRUip7tQqXcvMzlV0O6yRCQXNMSLgPns'

export const supabase = createClient(supabaseUrl, supabaseKey)