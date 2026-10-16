import { Audio } from 'expo-av';

export const COLORS = {
  bg: '#050716',
  panel: '#0D1028',
  panel2: '#151A3D',
  line: '#353A82',
  cyan: '#22D3FF',
  blue: '#287BFF',
  purple: '#A855F7',
  green: '#39F5B4',
  gold: '#FFD34E',
  red: '#FF477E',
  text: '#F6F5FF',
  muted: '#A3A8CF',
};

export function getAccent(theme) {
  if (theme === 'Verde') return COLORS.green;
  if (theme === 'Dorado') return COLORS.gold;
  if (theme === 'Azul') return COLORS.cyan;
  return '#B76BFF';
}

export async function playArenaSound(enabled, kind = 'tap') {
  if (!enabled) return;
  const urls = {
    tap: 'https://actions.google.com/sounds/v1/cartoon/pop.ogg',
    win: 'https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg',
    error: 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg',
    reveal: 'https://actions.google.com/sounds/v1/cartoon/positive_orchestral_1.ogg',
  };
  try {
    const { sound } = await Audio.Sound.createAsync({ uri: urls[kind] || urls.tap }, { shouldPlay: true, volume: 0.45 });
    sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
  } catch {}
}
