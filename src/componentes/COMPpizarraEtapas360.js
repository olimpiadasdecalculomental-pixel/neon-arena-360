import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { COLORS } from '../theme/TOKneonColors';
import { explicarEtapasVedicas } from '../contratos/CTRmotorEtapasVedicas';

const h = React.createElement;
const timeText = (n) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

export default function COMPpizarraEtapas360({ game, accent, onBack, onFinish, onMultijugadorProgress }) {
  const { q, qIndex, round, seconds, mode, typed, answerLength, checked, setChecked, isCorrect, full, vidas, bossHp, ocultarFactores, angulo360, setAngulo360 } = game;
  const etapaTexto = explicarEtapasVedicas(q.a, q.b, typed.length);

  const cells = Array.from({ length: answerLength }, (_, i) => {
    const pos = answerLength - 1 - i;
    const char = pos < typed.length ? typed[pos] : '';
    const expected = q.answer[i];
    const correct = char !== '' && char === expected;
    const activeStep = pos === typed.length;
    return h(
      View,
      {
        key: i,
        style: [
          st.cell,
          {
            borderColor: activeStep ? COLORS.gold : char ? (correct ? COLORS.green : COLORS.red) : COLORS.line,
            backgroundColor: char ? (correct ? '#0B493A' : '#4C1D32') : activeStep ? '#241F09' : '#08182D',
          },
        ],
      },
      h(Text, { style: st.cellTxt }, char || '·')
    );
  });

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'DEL', 0, 'OK'];

  return h(
    View,
    { style: { gap: 10 } },
    h(
      View,
      { style: st.topBar },
      h(Pressable, { onPress: onBack, style: st.backBtn }, h(Text, { style: st.backTxt }, '<')),
      h(
        View,
        { style: { flex: 1 } },
        h(Text, { style: [st.eyebrow, { color: accent }] }, `MODO ${mode.toUpperCase()} · NIVEL ${q.level}x${q.level}`),
        h(Text, { style: st.title }, `Operacion ${qIndex + 1} / ${round.length}`)
      ),
      mode === 'supervivencia'
        ? h(Text, { style: { color: COLORS.red, fontWeight: '900', fontSize: 16 } }, `Vidas: ${vidas}`)
        : h(View, { style: st.timerBox }, h(Text, { style: st.timerTxt }, timeText(seconds)))
    ),
    mode === 'jefe'
      ? h(
          View,
          { style: st.bossBox },
          h(Text, { style: { color: COLORS.gold, fontWeight: '900', fontSize: 11 } }, `GUARDIAN CYBER · HP ${bossHp}%`),
          h(View, { style: st.hpTrack }, h(View, { style: [st.hpFill, { width: `${bossHp}%` }] }))
        )
      : null,
    mode === 'arena360'
      ? h(
          View,
          { style: st.ring360 },
          h(Pressable, { onPress: () => setAngulo360((a) => (a + 315) % 360), style: st.rotBtn }, h(Text, { style: st.rotTxt }, '< Girar 360')),
          h(Text, { style: { color: COLORS.cyan, fontWeight: '900', fontSize: 12 } }, `ORBITA 360°: ${angulo360}°`),
          h(Pressable, { onPress: () => setAngulo360((a) => (a + 45) % 360), style: st.rotBtn }, h(Text, { style: st.rotTxt }, 'Girar 360 >'))
        )
      : null,
    h(
      View,
      { style: [st.board, { borderColor: accent }] },
      ocultarFactores
        ? h(Text, { style: [st.equation, { color: COLORS.gold }] }, '?  x  ? (MEMORIA)')
        : h(Text, { style: st.equation }, `${q.a} x ${q.b}`),
      h(
        View,
        { style: st.stepBanner },
        h(Text, { style: st.stepTitle }, `PASO ${Math.min(typed.length + 1, answerLength)} DE ${answerLength} (DERECHA A IZQUIERDA)`),
        h(Text, { style: st.stepDesc }, etapaTexto)
      ),
      h(View, { style: st.cellRow }, cells),
      h(
        View,
        { style: st.keypad },
        keys.map((k) =>
          h(
            Pressable,
            {
              key: String(k),
              onPress: async () => {
                if (k === 'DEL') game.borrar();
                else if (k === 'OK') {
                  if (full) {
                    const done = await game.siguientePregunta();
                    if (done) onFinish?.();
                  } else setChecked(true);
                } else {
                  game.digitar(k, onMultijugadorProgress);
                }
              },
              style: [st.key, k === 'OK' ? { backgroundColor: COLORS.green, borderColor: COLORS.green } : k === 'DEL' ? st.keyDel : null],
            },
            h(Text, { style: [st.keyTxt, k === 'OK' && { color: '#041326' }] }, String(k))
          )
        )
      ),
      checked || full
        ? h(
            View,
            { style: [st.feedback, { borderColor: isCorrect ? COLORS.green : COLORS.red }] },
            h(Text, { style: { color: isCorrect ? COLORS.green : COLORS.red, fontWeight: '900' } }, isCorrect ? 'EXCELENTE! ETAPAS COMPLETADAS' : `Respuesta correcta: ${q.answer}`)
          )
        : null,
      h(
        View,
        { style: { flexDirection: 'row', gap: 8, marginTop: 8 } },
        h(
          Pressable,
          { onPress: () => setChecked(true), style: st.secBtn },
          h(Text, { style: { color: COLORS.text, fontWeight: '900', fontSize: 12 } }, 'Ver Respuesta')
        ),
        h(
          Pressable,
          {
            onPress: async () => {
              const done = await game.siguientePregunta();
              if (done) onFinish?.();
            },
            style: [st.secBtn, { backgroundColor: COLORS.green, borderColor: COLORS.green }],
          },
          h(Text, { style: { color: '#041326', fontWeight: '900', fontSize: 12 } }, qIndex === round.length - 1 ? 'FINALIZAR' : 'SIGUIENTE >')
        )
      )
    ),
    h(
      View,
      { style: st.statsBar },
      h(View, { style: st.statTile }, h(Text, { style: st.statLbl }, 'PUNTOS'), h(Text, { style: st.statVal }, String(game.score))),
      h(View, { style: st.statTile }, h(Text, { style: st.statLbl }, 'MONEDAS'), h(Text, { style: st.statVal }, `+${game.coins}`)),
      h(View, { style: st.statTile }, h(Text, { style: st.statLbl }, 'RACHA'), h(Text, { style: st.statVal }, `x${game.streak}`))
    )
  );
}

const st = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.panel2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.line },
  backTxt: { color: COLORS.cyan, fontSize: 20, fontWeight: '900' },
  eyebrow: { fontSize: 10, fontWeight: '900' },
  title: { color: COLORS.text, fontSize: 17, fontWeight: '900' },
  timerBox: { padding: 10, borderRadius: 10, backgroundColor: '#102B4B', borderWidth: 1, borderColor: COLORS.cyan },
  timerTxt: { color: COLORS.gold, fontWeight: '900', fontSize: 14 },
  bossBox: { padding: 10, backgroundColor: '#240c1e', borderRadius: 12, borderWidth: 1, borderColor: COLORS.red, gap: 5 },
  hpTrack: { height: 8, backgroundColor: '#090C20', borderRadius: 4, overflow: 'hidden' },
  hpFill: { height: '100%', backgroundColor: COLORS.red },
  ring360: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, backgroundColor: '#08182D', borderRadius: 12, borderWidth: 1, borderColor: COLORS.cyan },
  rotBtn: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: COLORS.panel2, borderRadius: 8 },
  rotTxt: { color: COLORS.cyan, fontWeight: '800', fontSize: 11 },
  board: { backgroundColor: COLORS.panel, borderWidth: 1, borderRadius: 20, padding: 14, gap: 10 },
  equation: { color: COLORS.text, fontSize: 36, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },
  stepBanner: { backgroundColor: '#06182C', padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#214563', gap: 3 },
  stepTitle: { color: COLORS.gold, fontSize: 11, fontWeight: '900' },
  stepDesc: { color: COLORS.text, fontSize: 12 },
  cellRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
  cell: { width: 38, height: 46, borderWidth: 2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cellTxt: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 7 },
  key: { width: '30%', height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#102B4B', borderWidth: 1, borderColor: '#4245A0' },
  keyDel: { backgroundColor: '#39132E', borderColor: COLORS.red },
  keyTxt: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
  feedback: { borderWidth: 1, padding: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#06182C' },
  secBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.panel2, alignItems: 'center' },
  statsBar: { flexDirection: 'row', gap: 8 },
  statTile: { flex: 1, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.line, borderRadius: 12, padding: 10, alignItems: 'center' },
  statLbl: { color: COLORS.muted, fontSize: 9, fontWeight: '900' },
  statVal: { color: COLORS.text, fontSize: 16, fontWeight: '900', marginTop: 2 },
});
