import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alxbydjpoxoavasklwpd.supabase.co';
const supabaseKey = 'sb_publishable_Kc8wekwUqIs78ILNF-j-Qg_LNMYRhn0';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Puente API con la App 1 (perfiles_guerreros)
export async function vincularGuerreroExistente(codigoOTel) {
  const clean = String(codigoOTel || '').trim();
  if (!clean) return null;
  const { data } = await supabase.rpc('buscar_guerrero_limit10', { p_busqueda: clean });
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}
