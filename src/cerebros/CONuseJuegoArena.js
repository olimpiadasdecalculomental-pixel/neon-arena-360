import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { crearRondaPreguntas, calcularPuntosCompeticion } from '../contratos/CTRmotorEtapasVedicas';
import { playArenaSound } from '../theme/TOKneonColors';
import { registrarPartidaUnicaFila } from '../storage/STOarenaOffline';

export default function CONuseJuegoArena(jugador, setJugador, configSuprema) {
  const totalPregs = Number(configSuprema?.preguntas_por_ronda || 15);
  const totalSegs = Number(configSuprema?.tiempo_ronda_segundos || 1200);
  const [mode, setMode] = useState('solo');
  const [level, setLevel] = useState(2);
  const [round, setRound] = useState(() => crearRondaPreguntas(15, 2));
  const [qIndex, setQIndex] = useState(0);
  const [seconds, setSeconds] = useState(totalSegs);
  const [running, setRunning] = useState(false);
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [bossHp, setBossHp] = useState(100);
  const [ocultarFactores, setOcultarFactores] = useState(false);
  const [angulo360, setAngulo360] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [erroresEnPregunta, setErroresEnPregunta] = useState(false);
  const rewarded = useRef({});
  const startPreguntaTs = useRef(Date.now());

  const q = round[qIndex] || round[0];
  const answerLength = q.answer.length;
  const typedLeftToRight = typed.split('').reverse().join('');
  const full = typed.length === answerLength;
  const isCorrect = full && typedLeftToRight === q.answer;

  useEffect(() => {
    if (!running) return undefined;
    if (seconds <= 0) { finalizarPartida(); return undefined; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, seconds]);

  useEffect(() => {
    if (!running || mode !== 'memoria') { setOcultarFactores(false); return undefined; }
    setOcultarFactores(false);
    const t = setTimeout(() => setOcultarFactores(true), 4000);
    return () => clearTimeout(t);
  }, [running, mode, qIndex]);

  const iniciarPartida = (selectedMode = mode, customLevel = level, preguntasFijas = null) => {
    setMode(selectedMode);
    const list = crearRondaPreguntas(totalPregs, customLevel, preguntasFijas);
    setRound(list);
    setQIndex(0); setSeconds(totalSegs); setTyped(''); setChecked(false);
    setAnswers({}); setScore(0); setCoins(0); setStreak(0); setBestStreak(0);
    setVidas(3); setBossHp(100); setAngulo360(0); setErroresEnPregunta(false);
    rewarded.current = {};
    startPreguntaTs.current = Date.now();
    setRunning(true);
  };

  const digitar = (n, onScoreUpdate) => {
    if (!running || checked || typed.length >= answerLength) return;
    playArenaSound(soundOn, 'tap');
    const next = typed + String(n);
    setTyped(next);
    const rightPos = q.answer.length - next.length;

    if (q.answer[rightPos] !== String(n)) {
      setStreak(0);
      setErroresEnPregunta(true);
      playArenaSound(soundOn, 'error');
      if (mode === 'supervivencia') {
        const rest = vidas - 1;
        setVidas(rest);
        if (rest <= 0) { Alert.alert('Fin de Supervivencia', 'Agotaste tus 3 vidas.'); finalizarPartida(); return; }
      }
    }

    if (next.length === answerLength) {
      const val = next.split('').reverse().join('');
      const ok = val === q.answer;
      setAnswers((prev) => ({ ...prev, [qIndex]: { value: val, ok } }));
      if (ok && !rewarded.current[qIndex]) {
        rewarded.current[qIndex] = true;
        const segsUsados = Math.max(1, Math.round((Date.now() - startPreguntaTs.current) / 1000));
        const ptsGanados = calcularPuntosCompeticion({ level: q.level, racha: streak + 1, segundosUsados: segsUsados, sinErrores: !erroresEnPregunta });
        const nuevoScore = score + ptsGanados;
        setScore(nuevoScore);
        setCoins((c) => c + 10);
        setBossHp((hp) => Math.max(0, hp - Math.ceil(100 / totalPregs)));
        setStreak((s) => { const ns = s + 1; setBestStreak((b) => Math.max(b, ns)); return ns; });
        playArenaSound(soundOn, 'win');
        onScoreUpdate?.(nuevoScore, qIndex + 1);
      }
    }
  };

  const borrar = () => {
    if (!checked && typed.length) setTyped(typed.slice(0, -1));
  };

  const siguientePregunta = async () => {
    if (qIndex < round.length - 1) {
      setQIndex((i) => i + 1);
      setTyped('');
      setChecked(false);
      setErroresEnPregunta(false);
      setAngulo360((a) => (a + 45) % 360);
      startPreguntaTs.current = Date.now();
      return false;
    }
    await finalizarPartida();
    return true;
  };

  const finalizarPartida = async () => {
    setRunning(false);
    const actualizado = await registrarPartidaUnicaFila({ puntos: score, monedas: coins, racha: bestStreak, nivel: level });
    if (actualizado) setJugador?.(actualizado);
  };

  return {
    mode, setMode, level, setLevel, round, q, qIndex, answerLength, typed, typedLeftToRight,
    full, isCorrect, checked, setChecked, seconds, running, setRunning, answers,
    score, coins, streak, bestStreak, vidas, bossHp, ocultarFactores, angulo360, setAngulo360,
    soundOn, setSoundOn, iniciarPartida, digitar, borrar, siguientePregunta, finalizarPartida,
  };
}
