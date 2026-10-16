import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../theme/TOKneonColors';

const h = React.createElement;

export default function VISsalaMultijugador({ multi, level, setLevel, onStartMatch, onBack }) {
  const { sala, setSala, codigoInput, setCodigoInput, cupoElegido, setCupoElegido, cargando, crearSala, unirseASala, iniciarPartidaSala } = multi;

  if (!sala) {
    return h(
      View,
      { style: st.panel },
      h(Text, { style: st.title }, 'ARENA MULTIJUGADOR EN TIEMPO REAL'),
      h(Text, { style: st.sub }, 'Elige la capacidad de la sala (2 = Duelo 1v1, o Salas de 4, 8 y 10 jugadores):'),
      h(
        View,
        { style: st.row },
        [2, 4, 8, 10].map((c) =>
          h(
            Pressable,
            {
              key: c,
              onPress: () => setCupoElegido(c),
              style: [st.cupoBtn, { borderColor: cupoElegido === c ? COLORS.cyan : COLORS.line, backgroundColor: cupoElegido === c ? '#0d2638' : COLORS.panel2 }],
            },
            h(Text, { style: { color: COLORS.text, fontWeight: '900' } }, `${c} Jugadores`)
          )
        )
      ),
      h(Text, { style: st.sub }, 'Nivel de digitos para todos los rivales:'),
      h(
        View,
        { style: st.row },
        [2, 3, 4, 5].map((n) =>
          h(
            Pressable,
            {
              key: n,
              onPress: () => setLevel(n),
              style: [st.cupoBtn, { borderColor: level === n ? COLORS.gold : COLORS.line }],
            },
            h(Text, { style: { color: COLORS.gold, fontWeight: '900' } }, `${n}x${n}`)
          )
        )
      ),
      h(
        Pressable,
        { disabled: cargando, onPress: () => crearSala(level), style: st.createBtn },
        h(Text, { style: st.createTxt }, cargando ? 'Creando Sala...' : `CREAR SALA DE ${cupoElegido} JUGADORES`)
      ),
      h(Text, { style: [st.sub, { marginTop: 10 }] }, 'O ingresa el codigo de la sala de tu amigo (ej. SALA-450):'),
      h(
        View,
        { style: st.row },
        h(TextInput, { value: codigoInput, onChangeText: setCodigoInput, autoCapitalize: 'characters', placeholder: 'SALA-XXX', placeholderTextColor: COLORS.muted, style: st.input }),
        h(
          Pressable,
          { disabled: cargando, onPress: () => unirseASala(codigoInput), style: st.joinBtn },
          h(Text, { style: { color: COLORS.cyan, fontWeight: '900' } }, 'UNIRME')
        )
      ),
      h(Pressable, { onPress: onBack, style: st.backBtn }, h(Text, { style: { color: COLORS.text, fontWeight: '800' } }, '<- Volver al Lobby'))
    );
  }

  const jugadores = Array.isArray(sala.jugadores_posiciones_json) ? sala.jugadores_posiciones_json : [];

  return h(
    View,
    { style: st.panel },
    h(Text, { style: { color: COLORS.gold, fontWeight: '900', fontSize: 18 } }, `CODIGO DE SALA: ${sala.codigo_sala}`),
    h(Text, { style: st.sub }, `Estado: ${sala.estado_sala} · Jugadores conectados: ${jugadores.length} / ${sala.cupo_maximo}`),
    jugadores.map((j, idx) =>
      h(
        View,
        { key: j.codigo, style: st.playerRow },
        h(Text, { style: { color: COLORS.cyan, fontWeight: '900', width: 26 } }, `#${idx + 1}`),
        h(Text, { style: { color: COLORS.text, fontWeight: '800', flex: 1 } }, `${j.alias} (${j.codigo})`),
        h(Text, { style: { color: COLORS.green, fontWeight: '900' } }, `${j.puntos || 0} pts (${j.progreso || 0}/15)`)
      )
    ),
    h(
      Pressable,
      {
        onPress: async () => {
          await iniciarPartidaSala();
          onStartMatch(sala.semilla_preguntas_json, sala.nivel_juego);
        },
        style: st.createBtn,
      },
      h(Text, { style: st.createTxt }, 'COMENZAR DUELO SINCRONIZADO AHORA')
    ),
    h(Pressable, { onPress: () => setSala(null), style: st.backBtn }, h(Text, { style: { color: COLORS.red, fontWeight: '800' } }, 'Salir de la Sala'))
  );
}

const st = StyleSheet.create({
  panel: { backgroundColor: COLORS.panel, borderColor: COLORS.purple, borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  title: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  sub: { color: COLORS.muted, fontSize: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cupoBtn: { flex: 1, minWidth: 70, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  createBtn: { padding: 14, borderRadius: 12, backgroundColor: COLORS.green, alignItems: 'center' },
  createTxt: { color: '#041326', fontWeight: '900', fontSize: 13 },
  input: { flex: 1, backgroundColor: '#06182C', borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, paddingHorizontal: 12, height: 44, color: COLORS.text, fontWeight: '900' },
  joinBtn: { paddingHorizontal: 16, justifyContent: 'center', backgroundColor: '#102B4B', borderRadius: 10, borderWidth: 1, borderColor: COLORS.cyan },
  playerRow: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#06182C', borderRadius: 10, borderWidth: 1, borderColor: '#1A3A5B' },
  backBtn: { padding: 12, alignItems: 'center', backgroundColor: COLORS.panel2, borderRadius: 10 },
});
