import { useState, useCallback, useEffect } from 'react'
import SeriesBuilder from './components/SeriesBuilder'
import ChartCanvas from './components/ChartCanvas'
import DateRangePicker from './components/DateRangePicker'
import WorkspacePanel from './components/WorkspacePanel'
import SettingsPanel from './components/SettingsPanel'
import { useDataEngine } from './hooks/useDataEngine'
import { defaultWorkspace } from './lib/chartConfig'
import { loadSettings, saveSettings } from './lib/workspace'
import { checkProxy } from './lib/dataSources'

const TABS = ['Series', 'Workspaces', 'Settings']

export default function App() {
  const [theme, setTheme] = useState(() => loadSettings().theme || 'dark')
  const [workspace, setWorkspace] = useState(defaultWorkspace)
  const [activeTab, setActiveTab] = useState('Series')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [proxyOk, setProxyOk] = useState(null)

  useEffect(() => {
    checkProxy().then(ok => setProxyOk(ok))
    const id = setInterval(() => checkProxy().then(ok => setProxyOk(ok)), 5000)
    return () => clearInterval(id)
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function handleThemeChange(t) {
    setTheme(t)
    const s = loadSettings()
    saveSettings({ ...s, theme: t })
  }

  // ── Workspace mutations ────────────────────────────────────────────────────
  function updateSeries(id, changes) {
    setWorkspace(prev => ({
      ...prev,
      series: prev.series.map(s => s.id === id ? { ...s, ...changes } : s),
    }))
  }

  function addSeries(s) {
    setWorkspace(prev => ({ ...prev, series: [...prev.series, s] }))
  }

  function removeSeries(id) {
    setWorkspace(prev => ({ ...prev, series: prev.series.filter(s => s.id !== id) }))
  }

  function setDateRange(dr) {
    setWorkspace(prev => ({ ...prev, dateRange: dr }))
  }

  function setLayoutMode(mode) {
    setWorkspace(prev => ({ ...prev, layoutMode: mode }))
  }

  function setWorkspaceName(name) {
    setWorkspace(prev => ({ ...prev, name }))
  }

  // ── Data engine ────────────────────────────────────────────────────────────
  const { mergedData, loading, loadingMsg, error, reload, registerLocalFile } = useDataEngine(workspace)

  const handleRegisterFile = useCallback(async (seriesId, file) => {
    return await registerLocalFile(seriesId, file)
  }, [registerLocalFile])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      {/* Proxy warning banner */}
      {proxyOk === false && (
        <div style={{
          background: '#5a1a00', color: '#ffb347', padding: '8px 16px',
          fontSize: 12, display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid #a03000', flexShrink: 0,
        }}>
          <span>⚠</span>
          <strong>Proxy not running.</strong>
          <span>Open a second terminal in the silver-chart-app folder and run:</span>
          <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 8px', borderRadius: 3, fontFamily: 'monospace' }}>python3 proxy.py</code>
        </div>
      )}

      {/* Top bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px',
        height: 48,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setSidebarOpen(o => !o)}
          title="Toggle sidebar"
          style={{ fontSize: 18 }}
        >
          ☰
        </button>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: 'var(--accent)' }}>
          COT Workbench
        </span>

        <span style={{ color: 'var(--border)', fontSize: 18 }}>|</span>

        <input
          value={workspace.name}
          onChange={e => setWorkspaceName(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-primary)',
            width: 260,
            padding: '4px 0',
          }}
          placeholder="Workspace name"
        />

        <div style={{ flex: 1 }} />

        {/* Layout mode toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[['overlay', '⊞ Overlay'], ['stacked', '⊟ Stacked']].map(([mode, label]) => (
            <button
              key={mode}
              className="btn"
              style={{
                fontSize: 12, padding: '4px 10px',
                background: workspace.layoutMode === mode ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: workspace.layoutMode === mode ? '#fff' : 'var(--text-secondary)',
                borderColor: workspace.layoutMode === mode ? 'var(--accent)' : 'var(--border)',
              }}
              onClick={() => setLayoutMode(mode)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Status indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
            <Spinner />
            {loadingMsg}
          </div>
        )}
        {error && (
          <span style={{ fontSize: 12, color: 'var(--red)' }} title={error}>⚠ Error</span>
        )}

        <button className="btn btn-ghost btn-icon" onClick={reload} title="Reload data" style={{ fontSize: 16 }}>
          ↻
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside style={{
            width: 300,
            flexShrink: 0,
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Sidebar tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: '10px 4px', fontSize: 12, fontWeight: 500,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
                    borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'color 0.15s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sidebar content (scrollable) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
              {activeTab === 'Series' && (
                <>
                  {/* Date range at top of Series tab */}
                  <section style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Date range
                    </div>
                    <DateRangePicker dateRange={workspace.dateRange} onChange={setDateRange} />
                  </section>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginBottom: 6 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                      Series ({workspace.series.length})
                    </div>
                    <SeriesBuilder
                      series={workspace.series}
                      seriesCount={workspace.series.length}
                      onAdd={addSeries}
                      onUpdate={updateSeries}
                      onRemove={removeSeries}
                      onRegisterFile={handleRegisterFile}
                    />
                  </div>
                </>
              )}

              {activeTab === 'Workspaces' && (
                <WorkspacePanel
                  current={workspace}
                  onLoad={setWorkspace}
                  onNew={setWorkspace}
                />
              )}

              {activeTab === 'Settings' && (
                <SettingsPanel theme={theme} onThemeChange={handleThemeChange} />
              )}
            </div>
          </aside>
        )}

        {/* Main chart area */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: 'var(--bg-primary)',
          overflow: 'hidden',
        }}>
          {error ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12,
            }}>
              <span style={{ fontSize: 32 }}>⚠️</span>
              <span style={{ color: 'var(--red)', fontSize: 14 }}>{error}</span>
              <button className="btn" onClick={reload}>Retry</button>
            </div>
          ) : loading && !mergedData?.length ? (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12, color: 'var(--text-muted)',
            }}>
              <Spinner size={28} />
              <span style={{ fontSize: 13 }}>{loadingMsg || 'Loading data…'}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 300, textAlign: 'center' }}>
                CFTC data is fetched fresh from cftc.gov — this takes 15–30 seconds on first load.
              </span>
            </div>
          ) : (
            <ChartCanvas
              mergedData={mergedData}
              series={workspace.series}
              layoutMode={workspace.layoutMode}
              workspaceName={workspace.name}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function Spinner({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'spin 0.9s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
