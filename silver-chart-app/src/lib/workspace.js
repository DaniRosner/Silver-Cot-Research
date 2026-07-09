const STORAGE_KEY = 'cot_workbench_workspaces'
const SETTINGS_KEY = 'cot_workbench_settings'

export function loadWorkspaces() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

export function saveWorkspace(workspace) {
  const workspaces = loadWorkspaces()
  const idx = workspaces.findIndex(w => w.id === workspace.id)
  if (idx >= 0) workspaces[idx] = workspace
  else workspaces.push(workspace)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces))
  return workspaces
}

export function deleteWorkspace(id) {
  const workspaces = loadWorkspaces().filter(w => w.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces))
  return workspaces
}

export function exportWorkspace(workspace) {
  const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${workspace.name.replace(/\s+/g, '_')}.cot-workspace.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportAllWorkspaces(workspaces) {
  const blob = new Blob([JSON.stringify(workspaces, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cot_workspaces_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importWorkspacesFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(Array.isArray(data) ? data : [data])
      } catch { reject(new Error('Invalid workspace file')) }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch { return {} }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function newWorkspaceId() {
  return `ws_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export function newSeriesId() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
