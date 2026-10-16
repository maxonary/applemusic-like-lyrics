# Bedroom AMLL display

Deployed on Raspberry Pi3, without moving the Pi4. Uses AMLL0.6 MeshGradientRenderer
for a static album-derived background at 20% render scale. Expensive continuous mesh
animation is disabled; only small CSS playback indicators animate.

Frontend: Vite build (`npm ci && npm run build`), deploy dist to the AMLL_ROOT path.
Backend: Python3 standard library `server.py`, localhost3600, serves the built frontend
and /state, /art, /diagnostics. Default AMLL_ROOT is the current Bedroom deployment
/home/pi/shairport-metadata-display/public/amll. The directory name is historical;
the second project's Node server is disabled. Gateway is the ONLY FIFO reader.

Gateway reads /run/bedroom-now-playing/metadata, supporting legacy title/artwork/RTP
messages plus Shairport5.6 ssnc/copl binary-plist updateMRNowPlayingInfo. Snapshots
survive browser reconnects while the gateway stays running. No prior-track cache is
persisted after a gateway restart, so the source must send fresh metadata.
RTP progress currently assumes48kHz, matching Bedroom's observed AirPlay streams;
plist timing is in seconds and does not use that assumption.

UI distinguishes idle, active without metadata, playing, paused, ended and reconnecting.
No fake playback buttons or lyrics. Timeline hidden unless duration/progress exists.
Long titles clamp to three lines. Artwork has entry transitions; stale art clears on
replacement tracks without artwork. Reduced-motion preferences are respected.

Validation: production build and gateway tests for binary-plist merge, pause, legacy
titles, RTP progress, artwork and disconnect. Real AirPlay artwork/title/progress is
still awaiting a fresh live track after deployment. No claim of exact Apple TV parity.
Legacy adapter.js tests remain as historical protocol tests, but it is no longer used.

Deployment service: bedroom-amll; kiosk bedroom-display. Other shairport-display and
bedroom-now-playing metadata services disabled to avoid competing FIFO readers.
Source AGPL-3.0. Page links to this corresponding source directory.
