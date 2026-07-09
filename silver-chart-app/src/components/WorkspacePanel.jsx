import { useState, useRef } from 'react'
import {
  loadWorkspaces, saveWorkspace, deleteWorkspace,
  exportWorkspace, exportAllWorkspaces, importWorkspacesFromFile,
  newWorkspaceId,
} from '../lib/workspace'
import { defaultWorkspace } from '../lib/chartConfig'

export default function WorkspacePanel({ current, onLoad, onNew }) {
  const [workspaces, setWorkspaces] = useState(loadWorkspaces)
  const [renaming, setRenaming] = useState(null)
  const importRef = useRef()

  function handleSaveCurrent() {
    const updated = saveWorkspace({ ...current, savedAt: new Date().toISOString() })
    setWorkspaces(updated)
  }

  function handleDelete(id) {
    if (!confirm('Delete this workspace?')) return
    setWorkspaces(deleteWorkspace(id))
  }

  function handleNew() {
    const ws = { ...defaultWorkspace(), id: newWorkspaceId(), name: 'New Workspace' }
    onNew(ws)
  }

  async function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const imported = await importWorkspacesFromFile(file)
      // Merge, overwriting by id
      let current = loadWorkspaces()
      for (const ws of imported) {
        const idx = current.findIndex(w => w.id === ws.id)
        if (idx >= 0) current[idx] = ws
        else current.push(ws)
      }
      localStorage.setItem('cot_workbench_workspaces', JSON.stringify(current))
      setWorkspaces(current)
    } catch (err) {
      alert('Import failed: ' + err.message)
    }
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSaveCurrent}>
          Save
        </button>
        <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={handleNew}>
          New
        </button>
        <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => exportWorkspace(current)}>
          Export
        </button>
        <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => importRef.current?.click()}>
          Import
        </button>
      </div>
      <input type="file" ref={importRef} accept=".json" style={{ display: 'none' }} onChange={handleImport} />

      {/* Workspace list */}
      {workspaces.length === 0 ? (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
          No saved workspaces yet. Save your current chart to get started.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {workspaces.map(ws => (
            <div key={ws.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: ws.id === current.id ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
              border: `1px solid ${ws.id === current.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '6px 8px',
            }}>
              {renaming === ws.id ? (
                <input
                  autoFocus
                  defaultValue={ws.name}
                  style={{ flex: 1, fontSize: 12 }}
                  onBlur={e => {
                    saveWorkspace({ ...ws, name: e.target.value })
                    setWorkspaces(loadWorkspaces())
                    setRenaming(null)
                  }}
                  onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                />
              ) : (
                <span
                  style={{ flex: 1, fontSize: 12, cursor: 'pointer', color: 'var(--text-primary)' }}
                  onClick={() => onLoad(ws)}
                  title="Load workspace"
                >
                  {ws.name}
                </span>
              )}
              <button className="btn-ghost btn-icon" title="Rename" onClick={() => setRenaming(ws.id)}
                style={{ fontSize: 13, padding: '2px 4px', color: 'var(--text-muted)' }}>
                ✏
              </button>
              <button className="btn-ghost btn-icon" title="Export" onClick={() => exportWorkspace(ws)}
                style={{ fontSize: 13, padding: '2px 4px', color: 'var(--text-muted)' }}>
                ⬇
              </button>
              <button className="btn-ghost btn-icon" title="Delete" onClick={() => handleDelete(ws.id)}
                style={{ fontSize: 13, padding: '2px 4px', color: 'var(--red)' }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {workspaces.length > 1 && (
        <button className="btn btn-ghost" style={{ fontSize: 11, justifyContent: 'center' }}
          onClick={() => exportAllWorkspaces(workspaces)}>
          Export all workspaces
        </button>
      )}
    </div>
  )
}
