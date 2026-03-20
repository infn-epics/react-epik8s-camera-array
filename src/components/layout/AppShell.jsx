import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { usePvwsStatus } from '../../hooks/usePv.js';
import { useApp } from '../../context/AppContext.jsx';
import Sidebar from './Sidebar.jsx';

/**
 * AppShell — Grafana-like layout with sidebar + header + content area.
 */
export default function AppShell({ children, theme, onToggleTheme }) {
  const { pvwsClient, devices } = useApp();
  const connected = usePvwsStatus(pvwsClient);
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <header className="app-navbar">
        <div className="navbar-brand">
          <span className="navbar-logo">⚛</span>
          <span className="navbar-title">EPIK8s</span>
        </div>

        <nav className="navbar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            📊 Dashboards
          </NavLink>
          <span className="nav-divider" />
          <NavLink to="/cameras" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            📷 Cameras
          </NavLink>
          <NavLink to="/instrumentation" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            🔧 Instrumentation
          </NavLink>
          <NavLink to="/beamline" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            🔬 Beamline
          </NavLink>
          <NavLink to="/layout" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            🗺 Layout
          </NavLink>
          <span className="nav-divider" />
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            ⚙ Settings
          </NavLink>
        </nav>

        <div className="navbar-status">
          <span className="device-count">{devices.length} devices</span>
          <span className={`conn-badge ${connected ? 'connected' : 'disconnected'}`}>
            {connected ? '● PVWS' : '○ PVWS'}
          </span>
          <button className="theme-toggle" onClick={onToggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
        </div>
      </header>

      <div className="app-body">
        {isDashboard && (
          <Sidebar
            collapsed={!sidebarOpen}
            onToggle={() => setSidebarOpen((o) => !o)}
          />
        )}
        <main className={`app-content ${isDashboard ? 'with-sidebar' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
