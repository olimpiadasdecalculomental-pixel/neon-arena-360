import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { COLORS } from '../theme/TOKneonColors';
import { supabase } from '../config/CFGsupabaseArena';

const h = React.createElement;

export default function VISadminArena({ configSuprema, onSaved, onClose }) {
  const [pin, setPin] = useState('');
  const [autorizado, setAutorizado] = useState(false);
  const [cupo, setCupo] = useState(String(configSuprema?.cupo_jugadores_sala || 2));
  const [torneoNombre, setTorneoNombre] = useState(configSuprema?.nombre_torneo_activo || 'GRAN COPA NEON ARENA 360');
  const [fechaTorneo, setFechaTorneo] = useState(configSuprema?.fecha_proximo_torneo_arena || 'Sabado 19:00 hrs');
  const [preguntas, setPreguntas] = useState(String(configSuprema?.preguntas_por_ronda || 15));
  const [apkUrl, setApkUrl] = useState(configSuprema?.link_apk_arena_ota || 'https://github.com');

  const verificarPin = () => {
    if (pin === '1234' || pin === '0000') setAutorizado(true);
    else Alert.alert('PIN Incorrecto', 'Ingresa el PIN maestro del SuperAdmin (1234).');
  };

  const guardarConfig = async () => {
    const payload = {
      cupo_jugadores_sala: Number(cupo || 2),
      nombre_torneo_activo: torneoNombre.trim(),
      fecha_proximo_torneo_arena: fechaTorneo.trim(),
      preguntas_por_ronda: Number(preguntas || 15),
      link_apk_arena_ota: apkUrl.trim(),
    };
    const { data, error } = await supabase.from('arena_config_suprema').update(payload).eq('id', 1).select('*').single();
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    onSaved?.(data);
    Alert.alert('Configuracion Guardada!', `Ahora las salas admiten ${payload.cupo_jugadores_sala} jugadores y la fecha del torneo se actualizo en vivo.`);
    onClose?.();
  };

  if (!autorizado) {
    return h(
      View,
      { style: st.panel },
      h(Text, { style: st.title }, 'ACCESO SUPERADMIN · NEON ARENA'),
      h(TextInput, { value: pin, onChangeText: setPin, keyboardType: 'number-pad', secureTextEntry: true, placeholder: 'PIN SuperAdmin (1234)', placeholderTextColor: COLORS.muted, style: st.input }),
      h(Pressable, { onPress: verificarPin, style: st.saveBtn }, h(Text, { style: st.saveTxt }, 'ENTRAR AL PANEL DE CONTROL')),
      h(Pressable, { onPress: onClose, style: st.backBtn }, h(Text, { style: { color: COLORS.text } }, 'Cancelar'))
    );
  }

  return h(
    View,
    { style: st.panel },
    h(Text, { style: st.title }, 'CONTROL SUPREMO DE OLIMPIADAS Y SALAS'),
    h(Text, { style: st.lbl }, '1. Cantidad de Jugadores por Sala (2, 4, 8 o 10):'),
    h(
      View,
      { style: { flexDirection: 'row', gap: 8 } },
      ['2', '4', '8', '10'].map((n) =>
        h(
          Pressable,
          { key: n, onPress: () => setCupo(n), style: [st.chip, { borderColor: cupo === n ? COLORS.green : COLORS.line }] },
          h(Text, { style: { color: COLORS.text, fontWeight: '900' } }, `${n} Jug.`)
        )
      )
    ),
    h(Text, { style: st.lbl }, '2. Nombre del Torneo / Olimpiada:'),
    h(TextInput, { value: torneoNombre, onChangeText: setTorneoNombre, style: st.input }),
    h(Text, { style: st.lbl }, '3. Fecha y Hora Oficial del Torneo:'),
    h(TextInput, { value: fechaTorneo, onChangeText: setFechaTorneo, style: st.input }),
    h(Text, { style: st.lbl }, '4. Cantidad de Operaciones por Ronda:'),
    h(TextInput, { value: preguntas, onChangeText: setPreguntas, keyboardType: 'number-pad', style: st.input }),
    h(Text, { style: st.lbl }, '5. Link APK Directo GitHub (OTA):'),
    h(TextInput, { value: apkUrl, onChangeText: setApkUrl, style: st.input }),
    h(Pressable, { onPress: guardarConfig, style: st.saveBtn }, h(Text, { style: st.saveTxt }, 'GUARDAR CAMBIOS EN VIVO')),
    h(Pressable, { onPress: onClose, style: st.backBtn }, h(Text, { style: { color: COLORS.text } }, 'Cerrar Panel'))
  );
}

const st = StyleSheet.create({
  panel: { backgroundColor: COLORS.panel, borderColor: COLORS.gold, borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  title: { color: COLORS.gold, fontSize: 17, fontWeight: '900' },
  lbl: { color: COLORS.muted, fontSize: 11, fontWeight: '800' },
  input: { backgroundColor: '#06182C', borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, paddingHorizontal: 12, height: 42, color: COLORS.text },
  chip: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 2, alignItems: 'center', backgroundColor: COLORS.panel2 },
  saveBtn: { padding: 14, borderRadius: 12, backgroundColor: COLORS.green, alignItems: 'center', marginTop: 6 },
  saveTxt: { color: '#041326', fontWeight: '900' },
  backBtn: { padding: 10, alignItems: 'center' },
});
