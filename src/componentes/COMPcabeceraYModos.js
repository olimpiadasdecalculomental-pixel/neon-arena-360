import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../theme/TOKneonColors';
import { MODOS_ARENA } from '../contratos/CTRmotorEtapasVedicas';

const h = React.createElement;

export function COMPcabeceraArena({ jugador, soundOn, onToggleSound, onFiveTaps }) {
  return h(
    View,
    { style: st.topbar },
    h(
      Pressable,
      { onPress: onFiveTaps, style: st.brandBox },
      h(View, { style: st.brandMark }, h(Text, { style: st.brandMarkTxt }, '360')),
      h(
        View,
        null,
        h(Text, { style: st.brandTitle }, 'NEON ARENA 360'),
        h(Text, { style: st.brandSub }, `${jugador?.alias_jugador || 'Jugador'} · ${jugador?.codigo_guerrero || ''}`)
      )
    ),
    h(
      View,
      { style: st.currencies },
      h(View, { style: st.pillGold }, h(Text, { style: st.pillGoldTxt }, `Monedas: ${jugador?.monedas_juego ?? 0}`)),
      h(View, { style: st.pillCyan }, h(Text, { style: st.pillCyanTxt }, `ELO: ${jugador?.puntos_competicion ?? 0}`))
    ),
    h(
      Pressable,
      { onPress: onToggleSound, style: st.soundBtn },
      h(Text, { style: { color: COLORS.cyan, fontWeight: '900' } }, soundOn ? 'ON' : 'MUTE')
    )
  );
}

export function COMPselectorModosYNiveles({ level, setLevel, accent, onStartMode, onBack }) {
  return h(
    View,
    { style: st.panel },
    h(Text, { style: st.panelTitle }, '1. ELIGE EL NIVEL DE DIGITOS (2x2 HASTA 8x8)'),
    h(
      View,
      { style: st.levelGrid },
      [2, 3, 4, 5, 6, 7, 8].map((n) =>
        h(
          Pressable,
          {
            key: n,
            onPress: () => setLevel(n),
            style: [st.levelCard, { borderColor: level === n ? accent : COLORS.line, backgroundColor: level === n ? '#1f1942' : COLORS.panel2 }],
          },
          h(Text, { style: [st.levelNum, { color: level === n ? accent : COLORS.text }] }, `${n}x${n}`),
          h(Text, { style: { color: COLORS.muted, fontSize: 10 } }, `${n} digitos`)
        )
      )
    ),
    h(Text, { style: [st.panelTitle, { marginTop: 14 }] }, '2. ELIGE LA MODALIDAD DE JUEGO'),
    MODOS_ARENA.map((m) =>
      h(
        Pressable,
        { key: m.id, onPress: () => onStartMode(m.id), style: st.modeRow },
        h(Text, { style: { color: accent, fontSize: 22, fontWeight: '900', width: 32 } }, m.icono),
        h(
          View,
          { style: { flex: 1 } },
          h(Text, { style: { color: COLORS.text, fontWeight: '900', fontSize: 14 } }, m.nombre),
          h(Text, { style: { color: COLORS.muted, fontSize: 11 } }, m.desc)
        ),
        h(Text, { style: { color: COLORS.gold, fontWeight: '900', fontSize: 10 } }, m.tag)
      )
    ),
    h(
      Pressable,
      { onPress: onBack, style: st.backBtn },
      h(Text, { style: { color: COLORS.text, fontWeight: '900' } }, '<- VOLVER AL LOBBY')
    )
  );
}

const st = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#29265F', gap: 8 },
  brandBox: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  brandMark: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#111A42', borderWidth: 2, borderColor: COLORS.cyan, alignItems: 'center', justifyContent: 'center' },
  brandMarkTxt: { color: COLORS.cyan, fontWeight: '900', fontSize: 13 },
  brandTitle: { color: COLORS.text, fontWeight: '900', fontSize: 13 },
  brandSub: { color: COLORS.cyan, fontWeight: '700', fontSize: 10 },
  currencies: { flexDirection: 'row', gap: 6 },
  pillGold: { backgroundColor: '#171A3D', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 8, borderWidth: 1, borderColor: COLORS.gold },
  pillGoldTxt: { color: COLORS.gold, fontWeight: '900', fontSize: 11 },
  pillCyan: { backgroundColor: '#08182D', borderRadius: 12, paddingVertical: 6, paddingHorizontal: 8, borderWidth: 1, borderColor: COLORS.cyan },
  pillCyanTxt: { color: COLORS.cyan, fontWeight: '900', fontSize: 11 },
  soundBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: '#102B4B', borderWidth: 1, borderColor: COLORS.line },
  panel: { backgroundColor: COLORS.panel, borderColor: '#34317B', borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  panelTitle: { color: COLORS.text, fontSize: 15, fontWeight: '900' },
  levelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  levelCard: { width: '30%', padding: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  levelNum: { fontSize: 18, fontWeight: '900' },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.panel2, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: COLORS.line },
  backBtn: { padding: 13, borderRadius: 12, backgroundColor: '#171A3D', alignItems: 'center', marginTop: 6 },
});
