import { createClient } from '@supabase/supabase-js';

// Datos del proyecto del usuario según la captura
const supabaseUrl = 'https://qaoxyy1hkcchwyhuduwp.supabase.co';
// Nota: Esta es la ANON KEY. Normalmente se usa una variable de entorno (.env)
// pero para facilitar al usuario en su entorno local, la dejaremos aquí por ahora.
// El usuario debe obtenerla de Settings -> API -> anon public
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhb3h5eWloa2NjaHd5aHVkdXdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjE1MjgsImV4cCI6MjA4ODAzNzUyOH0.jQbQ_gTgyi5DJLmoY0AIeDPprlhmobRaXCVYSfwSWWU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
