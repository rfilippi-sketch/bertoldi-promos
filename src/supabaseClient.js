import { createClient } from '@supabase/supabase-js';

// Datos del proyecto del usuario según la captura
const supabaseUrl = 'https://qaoxyyihkcchwyhuduwp.supabase.co';
// Nota: Esta es la ANON KEY. Normalmente se usa una variable de entorno (.env)
// pero para facilitar al usuario en su entorno local, la dejaremos aquí por ahora.
// El usuario debe obtenerla de Settings -> API -> anon public
const supabaseAnonKey = 'sb_publishable_Kn_3i19_EtlCocbjLEakxw_Vlde5KLz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
