import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../theme/TOKneonColors';
import { supabase, vincularGuerreroExistente } from '../config/CFGsupabaseArena';
import { guardarJugadorLocal } from '../storage/STOarenaOffline';

const h = React.createElement;

export default function VISarenaHome({ jugador, setJugador, configSuprema, accent, onNavigate }) {
  const [subVista, setSubVista] = useState('lobby');
  const [ranking, setRanking] = useState([]);
  const [codigoVincular, setCodigoVincular] = useState('');
  const [aliasEdit, setAliasEdit] = useState(jugador?.alias_jugador || 'Jugador');

  useEffect(() => {
    if (subVista !== 'ranking') return;
    supabase
      .from('arena_perfil_unico_jugador')
      .select('codigo_guerrero,alias_jugador,puntos_competicion,mejor_racha,nivel_maximo')
      .order('puntos_competicion', { ascending: false })
      .limit(20)
      .then(({ data }) => setRanking(data || []));
  }, [subVista]);

  const conectarConOlimpiada = async () => {
    const perfil = await vincularGuerreroExistente(codigoVincular);
    if (!perfil) {
      Alert.alert('No encontrado', 'No hallamos ese codigo ORBE en la app principal.');
      return;
    }
    const next = await guardarJugadorLocal({
      codigo_guerrero: perfil.codigo_guerrero,
      alias_jugador: perfil.nombre_mostrar,
      creditos_recompensa: Number(perfil.puntos_mto || 0),
    });
    setJugador(next);
    Alert.alert('Cuenta Vinculada!', `Conectado con ${perfil.nombre_mostrar} (${perfil.codigo_guerrero}).`);
  };

  const comprarCosmetico = async (nombreItem, costoMonedas, nuevoTema) => {
    if (Number(jugador?.monedas_juego || 0) < costoMonedas) {
      Alert.alert('Monedas insuficientes', `Necesitas ${costoMonedas} monedas de juego (ganalas entrenando).`);
      return;
    }
    const next = await guardarJugadorLocal({
      monedas_juego: Number(jugador.monedas_juego) - costoMonedas,
      tema_color: nuevoTema || jugador.tema_color,
    });
    setJugador(next);
    Alert.alert('Cosmetico Equipado!', `Desbloqueaste ${nombreItem}.`);
  };

  if (subVista === 'ranking') {
    return h(
      View,
      { style: st.panel },
      h(Text, { style: st.heroTitle }, 'RANKING DE CAMPEONES (1 SOLA FILA POR JUGADOR)'),
      ranking.map((r, i) =>
        h(
          View,
          { key: r.codigo_guerrero, style: st.rankRow },
          h(Text, { style: { color: i === 0 ? COLORS.gold : COLORS.cyan, fontWeight: '900', width: 28 } }, `#${i + 1}`),
          h(
            View,
            { style: { flex: 1 } },
            h(Text, { style: { color: COLORS.text, fontWeight: '900' } }, `${r.alias_jugador} (${r.codigo_guerrero})`),
            h(Text, { style: { color: COLORS.muted, fontSize: 11 } }, `Racha: x${r.mejor_racha} · Nivel Max: ${r.nivel_maximo}x${r.nivel_maximo}`)
          ),
          h(Text, { style: { color: COLORS.gold, fontWeight: '900' } }, `${r.puntos_competicion} ELO`)
        )
      ),
      h(Pressable, { onPress: () => setSubVista('lobby'), style: st.btnSec }, h(Text, { style: st.btnSecTxt }, '<- VOLVER AL INICIO'))
    );
  }

  if (subVista === 'tienda') {
    return h(
      View,
      { style: st.panel },
      h(Text, { style: st.heroTitle }, 'ECONOMIA SEGURA DE 3 NIVELES'),
      h(Text, { style: st.copy }, `1. Monedas de Juego (${jugador?.monedas_juego || 0}): Para avatares y temas visuales.\n2. Puntos ELO (${jugador?.puntos_competicion || 0}): Miden tu habilidad (no se compran).\n3. Creditos (${jugador?.creditos_recompensa || 0}): Premios de Olimpiada.`),
      [
        ['Tema Neon Verde Cyber', 30, 'Verde'],
        ['Tema Dorado Imperial', 50, 'Dorado'],
        ['Tema Azul Holografico', 30, 'Azul'],
        ['Tema Violeta Original', 10, 'Violeta'],
      ].map(([nom, costo, tm]) =>
        h(
          Pressable,
          { key: nom, onPress: () => comprarCosmetico(nom, costo, tm), style: st.rankRow },
          h(Text, { style: { color: COLORS.text, fontWeight: '800', flex: 1 } }, nom),
          h(Text, { style: { color: COLORS.gold, fontWeight: '900' } }, `${costo} Monedas`)
        )
      ),
      h(Pressable, { onPress: () => setSubVista('lobby'), style: st.btnSec }, h(Text, { style: st.btnSecTxt }, '<- VOLVER'))
    );
  }

  return h(
    View,
    { style: { gap: 12 } },
    h(
      View,
      { style: [st.panel, { borderColor: COLORS.cyan }] },
      h(Text, { style: { color: COLORS.green, fontWeight: '900', fontSize: 11 } }, `${configSuprema?.nombre_torneo_activo || 'COPA NEON ARENA 360'} · ${configSuprema?.fecha_proximo_torneo_arena || 'ACTIVO'}`),
      h(Text, { style: st.heroTitle }, 'DOMINA LA MULTIPLICACION POR ETAPAS'),
      h(Text, { style: st.copy }, `Salas configuradas por SuperAdmin: Hasta ${configSuprema?.cupo_jugadores_sala || 2} jugadores en simultaneo.`),
      h(
        Pressable,
        { onPress: () => onNavigate('modes'), style: [st.btnMain, { backgroundColor: accent }] },
        h(Text, { style: st.btnMainTxt }, 'JUGAR INDIVIDUAL / 360° / ETAPAS (OFFLINE)')
      ),
      h(
        Pressable,
        { onPress: () => onNavigate('multijugador'), style: [st.btnMain, { backgroundColor: COLORS.purple }] },
        h(Text, { style: [st.btnMainTxt, { color: '#fff' }] }, `SALA MULTIJUGADOR (2 A ${configSuprema?.cupo_jugadores_sala || 10} JUGADORES)`)
      )
    ),
    h(
      View,
      { style: { flexDirection: 'row', gap: 8 } },
      h(Pressable, { onPress: () => setSubVista('ranking'), style: st.quickCard }, h(Text, { style: st.quickTitle }, 'RANKING ELO')),
      h(Pressable, { onPress: () => setSubVista('tienda'), style: st.quickCard }, h(Text, { style: st.quickTitle }, 'TIENDA Y TEMAS'))
    ),
    h(
      View,
      { style: st.panel },
      h(Text, { style: { color: COLORS.cyan, fontWeight: '900', fontSize: 12 } }, 'TU ALIAS Y CONEXION API CON OLIMPIADA VEDICA'),
      h(
        View,
        { style: { flexDirection: 'row', gap: 8 } },
        h(TextInput, { value: aliasEdit, onChangeText: setAliasEdit, placeholder: 'Tu Alias', placeholderTextColor: COLORS.muted, style: st.input }),
        h(
          Pressable,
          { onPress: async () => { const n = await guardarJugadorLocal({ alias_jugador: aliasEdit }); setJugador(n); Alert.alert('Guardado', 'Alias actualizado.'); }, style: st.smallBtn },
          h(Text, { style: { color: COLORS.cyan, fontWeight: '900', fontSize: 12 } }, 'Guardar')
        )
      ),
      h(
        View,
        { style: { flexDirection: 'row', gap: 8 } },
        h(TextInput, { value: codigoVincular, onChangeText: setCodigoVincular, placeholder: 'Vincular Codigo ORBE-XXXX', placeholderTextColor: COLORS.muted, style: st.input }),
        h(Pressable, { onPress: conectarConOlimpiada, style: st.smallBtn }, h(Text, { style: { color: COLORS.gold, fontWeight: '900', fontSize: 12 } }, 'Vincular API'))
      )
    )
  );
}

const st = StyleSheet.create({
  panel: { backgroundColor: COLORS.panel, borderColor: '#34317B', borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  heroTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  copy: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  btnMain: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnMainTxt: { color: '#041326', fontWeight: '900', fontSize: 13 },
  btnSec: { padding: 12, borderRadius: 10, backgroundColor: COLORS.panel2, alignItems: 'center' },
  btnSecTxt: { color: COLORS.text, fontWeight: '900' },
  quickCard: { flex: 1, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, borderRadius: 14, padding: 14, alignItems: 'center' },
  quickTitle: { color: COLORS.gold, fontWeight: '900', fontSize: 12 },
  rankRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#06182C', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1A3A5B' },
  input: { flex: 1, backgroundColor: '#06182C', borderWidth: 1, borderColor: '#315273', borderRadius: 10, paddingHorizontal: 10, height: 42, color: COLORS.text },
  smallBtn: { paddingHorizontal: 12, justifyContent: 'center', backgroundColor: COLORS.panel2, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line },
});
