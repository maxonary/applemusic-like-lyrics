import { BackgroundRender, MeshGradientRenderer } from '@applemusic-like-lyrics/core';
import '@applemusic-like-lyrics/core/style.css';
import './style.css';
import { initialState, reduce, position } from './adapter.js';
const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const base = new URL(import.meta.env.VITE_METADATA_URL || '/metadata/', location.href);
let state = initialState();
let background;
try {
  background = BackgroundRender.new(MeshGradientRenderer);
  $('background').append(background.getElement());
  background.setRenderScale(0.25);
  background.setFPS(15);
  background.setStaticMode(params.get('animated') !== '1');
} catch (error) { console.warn('AMLL background unavailable; using CSS fallback', error); }
let previousArt;
function render() {
  $('title').textContent = state.title || 'Not Playing';
  $('artist').textContent = state.artist || 'AirPlay to Bedroom';
  $('album').textContent = state.album;
  if (state.art !== previousArt) {
    previousArt = state.art;
    $('art').hidden = !state.art;
    $('placeholder').hidden = !!state.art;
    if (state.art) {
      $('art').src = state.art;
      background?.setAlbum(state.art).catch(error => console.warn('Artwork background unavailable', error));
    } else {
      $('art').removeAttribute('src');
      // Clear previous-track background when a session ends.
      background?.getElement().style.setProperty('visibility', 'hidden');
    }
    if (state.art) background?.getElement().style.setProperty('visibility', 'visible');
  }
  const elapsed = position(state);
  const format = seconds => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  $('progress').max = state.duration || 1;
  $('progress').value = state.duration ? elapsed : 0;
  $('elapsed').textContent = format(elapsed);
  $('remaining').textContent = state.duration ? `−${format(Math.max(0, state.duration - elapsed))}` : '';
}
function connect() {
  const url = new URL(base); url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(url);
  ws.onopen = () => { $('status').textContent = ''; };
  ws.onmessage = event => {
    try { state = reduce(state, JSON.parse(event.data), base); render(); }
    catch (error) { console.warn('Invalid metadata update', error); }
  };
  ws.onclose = () => {
    state = { ...state, elapsed: position(state), playing: false, at: Date.now() };
    $('status').textContent = 'Reconnecting…';
    setTimeout(connect, 3000);
  };
  ws.onerror = () => ws.close();
}
connect();
setInterval(render, 500);
render();
