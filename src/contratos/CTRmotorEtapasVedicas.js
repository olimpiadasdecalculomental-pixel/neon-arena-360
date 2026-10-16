export const MODOS_ARENA = [
  { id: 'solo', nombre: 'Entrenamiento Individual', desc: 'Sin internet, guiado por etapas y record local', tag: 'OFFLINE', icono: '◉' },
  { id: 'reloj', nombre: 'Carrera contra el Reloj', desc: '15 operaciones en 20 min con bono de precision', tag: 'TIEMPO', icono: '◷' },
  { id: 'supervivencia', nombre: 'Modo Supervivencia', desc: 'Solo 3 errores permitidos; sube la dificultad', tag: '3 VIDAS', icono: '♥' },
  { id: 'memoria', nombre: 'Memoria Relampago', desc: 'Memoriza los numeros en 4 seg y resuelve a ciegas', tag: 'FLASH', icono: '⚡' },
  { id: 'jefe', nombre: 'Jefe Matematico', desc: 'Derrota al Guardian Cyber con calculos exactos', tag: 'BOSS', icono: '♛' },
  { id: 'arena360', nombre: 'Laboratorio 360 Holografico', desc: 'Gira el anillo espacial 360 y resuelve retos', tag: '360°', icono: '◎' },
];

export function randDigits(digits) {
  const lo = Math.pow(10, digits - 1);
  const hi = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export function explicarEtapasVedicas(a, b, pasoActual) {
  const sa = String(a);
  const sb = String(b);
  const uA = Number(sa[sa.length - 1]);
  const uB = Number(sb[sb.length - 1]);
  if (pasoActual === 0) {
    return `ETAPA 1 (Unidades): Multiplica vertical ${uA} x ${uB} = ${uA * uB}. Escribe ${ (uA * uB) % 10 } a la derecha y lleva ${ Math.floor((uA * uB) / 10) }.`;
  }
  if (pasoActual === 1 && sa.length >= 2) {
    const dA = Number(sa[sa.length - 2]);
    const dB = Number(sb[sb.length - 2]);
    const cruce = dA * uB + uA * dB + Math.floor((uA * uB) / 10);
    return `ETAPA 2 (Aspas Central): (${dA}x${uB}) + (${uA}x${dB}) + llevada = ${cruce}. Anota ${cruce % 10} y lleva ${Math.floor(cruce / 10)}.`;
  }
  return `ETAPA ${pasoActual + 1} (Cierre Izquierdo): Calcula las columnas izquierdas mas la llevada mental y completa el resultado.`;
}

export function crearRondaPreguntas(total = 15, maxNivel = 2, semillaFija = null) {
  if (Array.isArray(semillaFija) && semillaFija.length > 0) return semillaFija;
  return Array.from({ length: total }, (_, i) => {
    const lvl = maxNivel <= 2 ? 2 : 2 + (i % (maxNivel - 1));
    const a = randDigits(lvl);
    const b = randDigits(lvl);
    return {
      id: `${Date.now()}-${i}`,
      a,
      b,
      answer: (BigInt(a) * BigInt(b)).toString(),
      level: lvl,
    };
  });
}

// Formula que combina Precision + Dificultad + Tiempo + Racha (No solo tocar rapido)
export function calcularPuntosCompeticion({ level, racha, segundosUsados, sinErrores }) {
  const baseDificultad = level * 60;
  const bonoPrecision = sinErrores ? 50 : 15;
  const bonoVelocidad = Math.max(10, 60 - Math.min(50, segundosUsados * 2));
  const bonoRacha = racha * 15;
  return baseDificultad + bonoPrecision + bonoVelocidad + bonoRacha;
}
