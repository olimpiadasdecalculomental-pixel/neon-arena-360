import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../config/CFGsupabaseArena';
import { crearRondaPreguntas } from '../contratos/CTRmotorEtapasVedicas';

export default function CONuseSalasMultijugador(jugador, cupoConfigAdmin = 2) {
  const [sala, setSala] = useState(null);
  const [codigoInput, setCodigoInput] = useState('');
  const [cupoElegido, setCupoElegido] = useState(cupoConfigAdmin || 2);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (cupoConfigAdmin) setCupoElegido(Number(cupoConfigAdmin));
  }, [cupoConfigAdmin]);

  useEffect(() => {
    if (!sala?.codigo_sala) return undefined;
    const ch = supabase
      .channel(`arena-sala-${sala.codigo_sala}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'arena_salas_en_vivo', filter: `codigo_sala=eq.${sala.codigo_sala}` },
        (payload) => { if (payload.new) setSala(payload.new); }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sala?.codigo_sala]);

  const crearSala = useCallback(async (nivel = 2) => {
    setCargando(true);
    const code = `SALA-${Math.floor(100 + Math.random() * 900)}`;
    const preguntas = crearRondaPreguntas(15, nivel);
    const jugadorInicial = {
      codigo: jugador?.codigo_guerrero || 'J1',
      alias: jugador?.alias_jugador || 'Jugador 1',
      puntos: 0,
      progreso: 0,
    };

    const { data, error } = await supabase
      .from('arena_salas_en_vivo')
      .insert({
        codigo_sala: code,
        creador_alias: jugadorInicial.alias,
        cupo_maximo: Number(cupoElegido || 2),
        nivel_juego: nivel,
        estado_sala: 'ESPERANDO',
        semilla_preguntas_json: preguntas,
        jugadores_posiciones_json: [jugadorInicial],
      })
      .select('*')
      .single();

    setCargando(false);
    if (error) { Alert.alert('Error al crear sala', error.message); return null; }
    setSala(data);
    return data;
  }, [jugador, cupoElegido]);

  const unirseASala = useCallback(async (codigo) => {
    const clean = String(codigo || codigoInput).trim().toUpperCase();
    if (!clean) return null;
    setCargando(true);
    const { data: actual } = await supabase.from('arena_salas_en_vivo').select('*').eq('codigo_sala', clean).maybeSingle();
    if (!actual) {
      setCargando(false);
      Alert.alert('Sala no encontrada', 'Verifica el codigo de la sala (ej. SALA-123).');
      return null;
    }

    const lista = Array.isArray(actual.jugadores_posiciones_json) ? [...actual.jugadores_posiciones_json] : [];
    const miCodigo = jugador?.codigo_guerrero || 'INVITADO';
    const yaEsta = lista.some((j) => j.codigo === miCodigo);

    if (!yaEsta && lista.length >= Number(actual.cupo_maximo || 10)) {
      setCargando(false);
      Alert.alert('Sala llena', `Esta sala ya alcanzo su limite de ${actual.cupo_maximo} jugadores.`);
      return null;
    }

    if (!yaEsta) {
      lista.push({ codigo: miCodigo, alias: jugador?.alias_jugador || 'Retador', puntos: 0, progreso: 0 });
    }

    const nuevoEstado = lista.length >= Number(actual.cupo_maximo) ? 'JUGANDO' : actual.estado_sala;
    const { data: actualizada } = await supabase
      .from('arena_salas_en_vivo')
      .update({ jugadores_posiciones_json: lista, estado_sala: nuevoEstado, updated_at: new Date().toISOString() })
      .eq('codigo_sala', clean)
      .select('*')
      .single();

    setCargando(false);
    setSala(actualizada || actual);
    return actualizada || actual;
  }, [codigoInput, jugador]);

  const reportarProgresoEnVivo = useCallback(async (nuevosPuntos, pregActual) => {
    if (!sala?.codigo_sala) return;
    const miCodigo = jugador?.codigo_guerrero || 'J1';
    const lista = (sala.jugadores_posiciones_json || []).map((j) =>
      j.codigo === miCodigo ? { ...j, puntos: nuevosPuntos, progreso: pregActual } : j
    );
    lista.sort((a, b) => b.puntos - a.puntos);
    await supabase
      .from('arena_salas_en_vivo')
      .update({ jugadores_posiciones_json: lista, updated_at: new Date().toISOString() })
      .eq('codigo_sala', sala.codigo_sala);
  }, [sala, jugador]);

  const iniciarPartidaSala = useCallback(async () => {
    if (!sala?.codigo_sala) return;
    const { data } = await supabase
      .from('arena_salas_en_vivo')
      .update({ estado_sala: 'JUGANDO', updated_at: new Date().toISOString() })
      .eq('codigo_sala', sala.codigo_sala)
      .select('*')
      .single();
    if (data) setSala(data);
  }, [sala]);

  return {
    sala, setSala, codigoInput, setCodigoInput, cupoElegido, setCupoElegido,
    cargando, crearSala, unirseASala, reportarProgresoEnVivo, iniciarPartidaSala,
  };
}
