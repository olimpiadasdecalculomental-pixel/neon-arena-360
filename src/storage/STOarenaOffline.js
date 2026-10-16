import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/CFGsupabaseArena';

const KEY_PERFIL = 'arena.perfil_local';
const KEY_COLA = 'arena.cola_pendiente';

export async function leerJugadorLocal() {
  try {
    const raw = await AsyncStorage.getItem(KEY_PERFIL);
    if (raw) return JSON.parse(raw);
  } catch {}
  const nuevo = {
    codigo_guerrero: `ARENA-${Math.floor(1000 + Math.random() * 9000)}`,
    alias_jugador: 'Jugador',
    monedas_juego: 0,
    puntos_competicion: 0,
    creditos_recompensa: 0,
    mejor_racha: 0,
    total_partidas: 0,
    nivel_maximo: 2,
    tema_color: 'Violeta',
  };
  await AsyncStorage.setItem(KEY_PERFIL, JSON.stringify(nuevo));
  return nuevo;
}

export async function guardarJugadorLocal(datos) {
  const actual = await leerJugadorLocal();
  const actualizado = { ...actual, ...datos };
  await AsyncStorage.setItem(KEY_PERFIL, JSON.stringify(actualizado));
  return actualizado;
}

export async function sincronizarColaPendiente() {
  try {
    const rawCola = await AsyncStorage.getItem(KEY_COLA);
    if (!rawCola) return null;
    const pendiente = JSON.parse(rawCola);
    const local = await leerJugadorLocal();
    const { data, error } = await supabase.rpc('arena_sincronizar_jugador_unico', {
      p_codigo: local.codigo_guerrero,
      p_alias: local.alias_jugador,
      p_puntos_ganados: Number(pendiente.puntos || 0),
      p_monedas_ganadas: Number(pendiente.monedas || 0),
      p_mejor_racha: Number(pendiente.racha || 0),
      p_nivel: Number(pendiente.nivel || 2),
    });
    if (!error && data) {
      await AsyncStorage.removeItem(KEY_COLA);
      return await guardarJugadorLocal(data);
    }
  } catch {}
  return null;
}

export async function registrarPartidaUnicaFila({ puntos, monedas, racha, nivel }) {
  const local = await leerJugadorLocal();
  const next = await guardarJugadorLocal({
    monedas_juego: Number(local.monedas_juego || 0) + Number(monedas || 0),
    puntos_competicion: Number(local.puntos_competicion || 0) + Math.round(Number(puntos || 0) / 5),
    mejor_racha: Math.max(Number(local.mejor_racha || 0), Number(racha || 0)),
    total_partidas: Number(local.total_partidas || 0) + 1,
    nivel_maximo: Math.max(Number(local.nivel_maximo || 2), Number(nivel || 2)),
  });

  try {
    const { data, error } = await supabase.rpc('arena_sincronizar_jugador_unico', {
      p_codigo: next.codigo_guerrero,
      p_alias: next.alias_jugador,
      p_puntos_ganados: Number(puntos || 0),
      p_monedas_ganadas: Number(monedas || 0),
      p_mejor_racha: Number(racha || 0),
      p_nivel: Number(nivel || 2),
    });
    if (!error && data) {
      await AsyncStorage.removeItem(KEY_COLA);
      return await guardarJugadorLocal(data);
    }
  } catch {
    await AsyncStorage.setItem(KEY_COLA, JSON.stringify({ puntos, monedas, racha, nivel }));
  }
  return next;
}
