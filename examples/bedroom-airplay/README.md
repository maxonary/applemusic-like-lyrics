# Bedroom AirPlay display prototype

Prepared independently of the live display. This is an AMLL-backed Now Playing frontend, not an exact Apple TV clone. Upstream targets iPad Apple Music and primarily supplies lyrics/background components. No Apple fonts, icons or assets are copied.

## Run on the Mac, consuming Bedroom's existing service

```sh
# Terminal 1: tunnel the metadata service (read-only consumer)
ssh -N -L 3600:127.0.0.1:3600 pi@192.168.2.89
# Terminal 2, from this directory
npm ci
npm run dev
```

Open http://127.0.0.1:5173. It receives the same metadata as the installed `shairport-metadata-display`; it does not open or consume the Shairport FIFO. The existing display keeps working. Alternative metadata host: `METADATA_TARGET=http://host:3600 npm run dev`.

The Vite development proxy maps `/metadata/` and its WebSocket to the upstream server. Artwork stays same-origin, which WebGL requires. For a future production deployment, serve `dist/` with an equivalent reverse proxy for HTTP **and WebSocket** `/metadata/` to localhost:3600 (strip `/metadata`). Do not use `vite preview` as the production server; it lacks this proxy configuration. Do not expose the metadata service publicly.

## Pi 3 default

AMLL `MeshGradientRenderer`, static mode on, quarter-resolution canvas. `?animated=1` enables optional 15 FPS animation for later profiling. Full lyric/mesh effects can be expensive: measure CPU, temperature, dropped AirPlay frames and Chromium memory on the Pi before deployment. CSS solid background remains if WebGL cannot initialize. No audio engine or device configuration changes.

## Protocol

Uses upstream WebSocket `{type, data}` events: `trackInfos` (title, artist, album, duration in ms), `position` (currPosition and duration in ms), `PICT` (relative artwork URL), `noPICT`, `pause`, `stop`, `noInfo`. Reconnects every three seconds. Progress is interpolated at two updates/second; pause/disconnect freezes progress. Metadata strings use textContent. Artwork restricted to the configured metadata server's `img/` path. No credentials involved.

Reconnect snapshots may lack playback position/status until the next upstream update: the upstream server does not currently send a complete state snapshot on connection. Preserve this limitation until its protocol is improved.

## Next stage

- Compare a real projector screenshot with the exact desired Apple TV artwork view.
- Profile static/animated rendering at 720p and 1080p on Bedroom before replacing its kiosk URL.
- Add synchronized lyrics only with a legitimate separate lyric source; AirPlay metadata does not supply them.
- Optionally replace the published 0.6.0 AMLL dependency with a locally built fork package when modifying core. The fork itself is unmodified upstream; this branch adds this integration example.

## Validation

`npm test`: metadata timings/pause, title formatting, artwork origin restrictions, stop reset. `npm run build`: production bundle. Hardware visual/performance checks are still pending; this branch is **not deployed**.

AGPL-3.0: this example follows the repository license. The page links its corresponding source.
