# EPIK8s Dashboard

A modular, configuration-driven React web application that provides a **Grafana-like experience** for creating and managing dashboards for EPICS-based particle accelerator systems. Supports both auto-generated views from YAML configuration and user-created custom dashboards with a pluggable widget system.

## Features

- **Dashboard CRUD** — Create, rename, duplicate, delete, and switch between multiple dashboards
- **Widget system** — 11 pluggable widget types with self-describing property schemas
- **Widget picker** — Browse widget types by category or add from YAML-discovered devices
- **Widget config panel** — Edit widget properties via auto-generated form editors
- **Multiple data sources** — Real-time EPICS PVs via PVWS WebSocket + historical data via Archiver Appliance REST
- **YAML-driven auto-discovery** — Loads `values.yaml` at runtime to discover all IOCs, devices, cameras, and zones
- **Multi-view application** — Custom Dashboards, Camera Array, Instrumentation, Beamline Overview
- **Grafana-like UI** — Collapsible sidebar with dashboard list, toolbar, and grid editor
- **Drag & drop layout** — react-grid-layout powered grids with resize, collapse, detail modals
- **JSON persistence** — Dashboards saved to localStorage with export/import as JSON files
- **Dark/Light theme** — Toggle between themes; preference saved
- **Zone-based beamline view** — Devices grouped by zone with summary cards and expandable grids

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173. Place your `values.yaml` in `public/` or pass `?values=/path/to/values.yaml`.

## Views

| View | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/dashboard` | User-created dashboards with widget editor (default) |
| Camera Array | `/cameras` | NxM grid of MJPEG camera streams with per-tile controls |
| Instrumentation | `/instrumentation` | All devices with search/filter and drag-drop layout |
| Beamline | `/beamline` | Zone-grouped device overview with summary cards |

## Widget Types

| Type | Category | Description |
|------|----------|-------------|
| `pv-display` | Generic | Single PV value display with severity coloring |
| `pv-control` | Generic | PV write control (slider, toggle, button, input) |
| `plot` | Generic | Archiver-based historical trend chart (canvas) |
| `table` | Generic | Multi-PV status table |
| `camera` | Devices | MJPEG stream with acquire/exposure/gain controls |
| `motor` | Devices | Position readback, move-to, stop, home, POI presets |
| `bpm` | Devices | Beam Position Monitor (X/Y + optional charge) |
| `vacuum` | Devices | Pressure display, valve control, alarm threshold |
| `power-supply` | Devices | Current/voltage read/set, on/off toggle |
| `charge-monitor` | Devices | Charge readback with sparkline trend |
| `generic-pv` | Devices | Fallback widget for any PV prefix |

## Dashboard JSON Format

Dashboards can be exported/imported as JSON:

```json
{
  "id": "dash-abc123",
  "name": "Injector Overview",
  "description": "Injector beamline devices",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "widgets": [
    {
      "id": "w-1",
      "type": "motor",
      "config": {
        "title": "FP1 Horizontal",
        "pvPrefix": "EUAPS:FPRCK1:W:CTR:FP1-HMN-01",
        "min": 0,
        "max": 12,
        "precision": 4
      },
      "layout": { "x": 0, "y": 0, "w": 3, "h": 4 }
    }
  ]
}
```

See [public/example-dashboard.json](public/example-dashboard.json) for a full example.

## Project Structure

```
src/
  App.jsx                            Main router + providers
  main.jsx                           Entry point
  index.css                          Global styles (dark/light theme)

  context/
    AppContext.jsx                    Config, devices, zones, PVWS + Archiver clients
    DashboardContext.jsx              Dashboard CRUD state management

  models/
    device.js                        Device normalization from YAML
    dashboard.js                     Dashboard/widget creation helpers

  services/
    pvws.js                          PVWS WebSocket client
    configLoader.js                  YAML config parser
    archiver.js                      EPICS Archiver Appliance REST client
    dashboardStorage.js              Dashboard localStorage + JSON export/import

  hooks/
    usePv.js                         PV subscription hooks
    useArchiver.js                   Archiver data fetching hook
    useTheme.js                      Dark/light theme toggle
    useLayout.js                     Layout state for auto-generated views

  widgets/
    registry.js                      Widget type definitions with property schemas
    WidgetFrame.jsx                  Universal widget container (drag/collapse/config)
    WidgetConfigPanel.jsx            Property editor side panel
    WidgetPicker.jsx                 Widget browse & add dialog
    types/
      PvDisplayWidget.jsx            Single PV display
      PvControlWidget.jsx            PV control (slider/toggle/button/input)
      CameraWidget.jsx               MJPEG camera stream
      MotorWidget.jsx                Motor control
      BPMWidget.jsx                  Beam Position Monitor
      VacuumWidget.jsx               Vacuum gauge/valve
      PowerSupplyWidget.jsx          Power supply control
      ChargeMonitorWidget.jsx        Charge monitor with trend
      PlotWidget.jsx                 Archiver-based canvas chart
      TableWidget.jsx                Multi-PV table
      GenericPVWidget.jsx            Generic PV fallback

  components/
    layout/
      AppShell.jsx                   Grafana-like shell (navbar + sidebar + content)
      Sidebar.jsx                    Dashboard list sidebar
      DashboardGrid.jsx              react-grid-layout wrapper
    views/
      DashboardView.jsx              Custom dashboard editor
      CameraView.jsx                 NxM camera grid
      InstrumentationView.jsx        Filterable device dashboard
      BeamlineView.jsx               Zone-based beamline layout
    common/
      PvControls.jsx                 PvDisplay, PvInput, PvSlider, StatusIndicator
      SearchFilter.jsx               Search/filter panel
```

## URL Parameters

| Param | Default | Description |
|---|---|---|
| `pvws` | `ws://<derived-host>/pvws/pv` | PVWS WebSocket endpoint |
| `archiver` | Auto-derived from namespace | Archiver Appliance REST URL |
| `values` | `/values.yaml` | Path to the YAML config |

## Data Sources

### PVWS (Real-time)
WebSocket connection to EPICS PVs via [pvws](https://github.com/ornl-epics/pvws). Subscribe, read, and write PV values in real-time.

### Archiver Appliance (Historical)
REST client for [EPICS Archiver Appliance](https://slacmshanern.github.io/epicsarchiverap/). Fetch historical PV data for trend plots. Used by the Plot widget.

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Serve with any static file server (nginx, Apache, etc.).
