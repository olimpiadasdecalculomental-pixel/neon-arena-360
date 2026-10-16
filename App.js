import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Pressable, StyleSheet, StatusBar, Platform, StatusBar as RNStatusBar, Linking } from 'react-native';
import { COLORS, getAccent } from './src/theme/TOKneonColors';
import { supabase } from './src/config/CFGsupabaseArena';
import { leerJugadorLocal, sincronizarColaPendiente } from './src/storage/STOarenaOffline';
import CONuseJuegoArena from './src/cerebros/CONuseJuegoArena';
import CONuseSalasMultijugador from './src/cerebros/CONuseSalasMultijugador';
import COMPpizarraEtapas360 from './src/componentes/COMPpizarraEtapas360';
import { COMPcabeceraArena, COMPselectorModosYNiveles } from './src/componentes/COMPcabeceraYModos';
import VISarenaHome from './src/pantallas/VISarenaHome';
import VISsalaMultijugador from './src/pantallas/VISsalaMultijugador';
import VISadminArena from './src/pantallas/VISadminArena';

const h = React.createElement;
const VERSION_LOCAL_ARENA = '1.0.0';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [taps, setTaps] = useState(0);
  const [jugador, setJugador] = useState(null);
  const [configSuprema, setConfigSuprema] = useState({
    cupo_jugadores_sala: 2,
    preguntas_por_ronda: 15,
    tiempo_ronda_segundos: 1200,
    version_apk_arena: '1.0.0',
    link_apk_arena_ota: '',
  });

  useEffect(() => {
    leerJugadorLocal().then(setJugador);
    sincronizarColaPendiente().then((sync) => { if (sync) setJugador(sync); });
    supabase.from('arena_config_suprema').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data) setConfigSuprema(data);
    });
  }, []);

  const game = CONuseJuegoArena(jugador, setJugador, configSuprema);
  const multi = CONuseSalasMultijugador(jugador, configSuprema?.cupo_jugadores_sala);
  const accent = getAccent(jugador?.tema_color || 'Violeta');
  const hayNuevaVersion = configSuprema?.version_apk_arena && configSuprema.version_apk_arena !== VERSION_LOCAL_ARENA && configSuprema?.link_apk_arena_ota;

  const handleFiveTaps = () => {
    const next = taps + 1;
    if (next >= 5) { setTaps(0); setScreen('admin'); }
    else setTaps(next);
  };

  let body = null;
  if (screen === 'admin') {
    body = h(VISadminArena, { configSuprema, onSaved: setConfigSuprema, onClose: () => setScreen('home') });
  } else if (screen === 'modes') {
    body = h(COMPselectorModosYNiveles, {
      level: game.level,
      setLevel: game.setLevel,
      accent,
      onStartMode: (m) => { game.iniciarPartida(m, game.level); setScreen('game'); },
      onBack: () => setScreen('home'),
    });
  } else if (screen === 'multijugador') {
    body = h(VISsalaMultijugador, {
      multi,
      level: game.level,
      setLevel: game.setLevel,
      onStartMatch: (semilla, lvl) => { game.iniciarPartida('duelo_sala', lvl, semilla); setScreen('game'); },
      onBack: () => setScreen('home'),
    });
  } else if (screen === 'game') {
    body = h(COMPpizarraEtapas360, {
      game,
      accent,
      onBack: () => { game.setRunning(false); setScreen('home'); },
      onFinish: () => setScreen('results'),
      onMultijugadorProgress: multi.sala ? multi.reportarProgresoEnVivo : undefined,
    });
  } else if (screen === 'results') {
    body = h(
      View,
      { style: st.resultsCard },
      h(Text, { style: st.resTitle }, 'RONDA COMPLETADA!'),
      h(Text, { style: st.resScore }, `${game.score} PTS`),
      h(Text, { style: st.resSub }, `Monedas ganadas: +${game.coins} · Mejor Racha: x${game.bestStreak}`),
      h(Text, { style: st.resSub }, 'Sincronizado en 1 sola fila en Supabase y guardado en modo Offline.'),
      h(
        Pressable,
        { onPress: () => setScreen('home'), style: [st.btn, { backgroundColor: accent }] },
        h(Text, { style: { color: '#041326', fontWeight: '900' } }, 'VOLVER AL LOBBY PRINCIPAL')
      )
    );
  } else {
    body = h(VISarenaHome, { jugador, setJugador, configSuprema, accent, onNavigate: setScreen });
  }

  return h(
    SafeAreaView,
    { style: st.safe },
    h(StatusBar, { barStyle: 'light-content', backgroundColor: COLORS.bg }),
    h(
      ScrollView,
      { contentContainerStyle: st.container, keyboardShouldPersistTaps: 'handled' },
      h(COMPcabeceraArena, {
        jugador,
        soundOn: game.soundOn,
        onToggleSound: () => game.setSoundOn((v) => !v),
        onFiveTaps: handleFiveTaps,
      }),
      hayNuevaVersion
        ? h(
            Pressable,
            { onPress: () => Linking.openURL(configSuprema.link_apk_arena_ota), style: st.otaBanner },
            h(Text, { style: st.otaTxt }, `NUEVA VERSION v${configSuprema.version_apk_arena} DISPONIBLE · TOCA PARA DESCARGAR APK`)
          )
        : null,
      body
    )
  );
}

const st = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 6 : 0,
    paddingBottom: Platform.OS === 'android' ? 36 : 0,
  },
  container: { padding: 15, paddingBottom: 40, width: '100%', maxWidth: 780, alignSelf: 'center' },
  otaBanner: { backgroundColor: COLORS.green, padding: 10, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  otaTxt: { color: '#041326', fontWeight: '900', fontSize: 11 },
  resultsCard: { backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.gold, borderRadius: 20, padding: 20, alignItems: 'center', gap: 10 },
  resTitle: { color: COLORS.text, fontSize: 22, fontWeight: '900' },
  resScore: { color: COLORS.gold, fontSize: 42, fontWeight: '900' },
  resSub: { color: COLORS.muted, fontSize: 12, textAlign: 'center' },
  btn: { paddingVertical: 14, paddingHorizontal: 22, borderRadius: 12, marginTop: 8 },
});
