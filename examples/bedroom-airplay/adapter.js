// Read-only consumer of shairport-metadata-display's WebSocket protocol.
export function initialState() { return { title: '', artist: '', album: '', art: '', duration: 0, elapsed: 0, playing: false, at: Date.now() }; }
const number = x => Number.isFinite(Number(x)) ? Math.max(0, Number(x)) : 0;
export function reduce(state, message, base, now = Date.now()) {
  const data = message.data || {};
  if (message.type === 'stop' || message.type === 'noInfo') return { ...initialState(), at: now };
  if (message.type === 'trackInfos') return { ...state, title: String(data.title || '').replace(/<\/?span>/g, ''), artist: String(data.artist || ''), album: String(data.album || ''), duration: number(data.duration) / 1000 };
  if (message.type === 'position') return { ...state, elapsed: number(data.currPosition) / 1000, duration: number(data.duration) / 1000, playing: true, at: now };
  if (message.type === 'pause') return { ...state, elapsed: position(state, now), playing: false, at: now };
  if (message.type === 'noPICT') return { ...state, art: '' };
  if (message.type === 'PICT' && data.url) {
    const url = new URL(data.url, base);
    // Artwork must be served by the metadata server, never a remote URL.
    if (url.origin !== new URL(base).origin || !url.pathname.startsWith(new URL('img/', base).pathname)) return state;
    return { ...state, art: url.href };
  }
  return state;
}
export function position(state, now = Date.now()) {
  const elapsed = state.elapsed + (state.playing ? Math.max(0, now - state.at) / 1000 : 0);
  return state.duration ? Math.min(state.duration, elapsed) : elapsed;
}
