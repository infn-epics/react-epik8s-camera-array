# EPIK8s Camera Array

A modern React web application that renders a configurable **N×M grid** of EPICS areaDetector camera MJPEG streams, with live PV control via **pvws** (PV Web Socket).

## Features

- **Dynamic grid** — configurable rows/cols (default 3×3), adjustable at runtime via the ⚙ panel or URL params
- **MJPEG streaming** — each tile renders a live `<img>` MJPEG stream from areaDetector IOCs
- **Camera selection** — dropdown per tile to pick any camera discovered from `values.yaml`
- **Stream control** — enable/disable button per tile with visual indicator
- **EPICS PV control** via WebSocket:
  - `${pv_prefix}:Acquire` — Start / Stop
  - `${pv_prefix}:AcquireTime` — Exposure slider
  - `${pv_prefix}:Gain` — Gain slider
- **Auto-discovery** — parses `values.yaml` and finds IOCs with `stream_enable: true`
- **Fully frontend** — no backend server needed; static files only

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Configuration

Place your `values.yaml` in the `public/` folder (it's served at `/values.yaml`).

The app extracts cameras from `epicsConfiguration.iocs[]` entries that have `stream_enable: true`, and builds:

| Field | Source |
|---|---|
| PV prefix | `iocprefix:deviceName` (e.g. `EUAPS:CAM:SIM01`) |
| MJPEG URL | `<namespace>-<iocname>.<domain>:<port>/<device>.mjpg` |

### URL Parameters

| Param | Default | Description |
|---|---|---|
| `rows` | `3` | Number of grid rows |
| `cols` | `3` | Number of grid columns |
| `pvws` | `ws://<host>/pvws/pv` | PVWS WebSocket endpoint |
| `values` | `/values.yaml` | Path to the YAML config |

Example: `http://localhost:3000/?rows=2&cols=4&pvws=ws://myhost/pvws/pv`

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static file server (nginx, Apache, etc.).

## Architecture

```
src/
  services/
    pvws.js           — PVWS WebSocket client (connect, subscribe, put)
    configLoader.js   — YAML parser, camera extractor
  hooks/
    usePv.js          — React hooks for PV subscription & status
  components/
    CameraGrid.jsx    — N×M CSS Grid layout
    CameraTile.jsx    — Individual tile: stream + selector + controls
    CameraControls.jsx— Acquire/Exposure/Gain controls
    ConnectionStatus.jsx — PVWS connection indicator
  App.jsx             — App shell, config loading, state
  index.css           — Dark theme styling
public/
  values.yaml         — Beamline configuration (auto-discovered cameras)
```
