
window.ipcRenderer.on('main-process-message', (_event, ...args) => {
  console.log('[Receive Main-process message]:', ...args)
})

// Listen for hard refresh keyboard shortcut (Cmd+R / Ctrl+R)
window.ipcRenderer.on('clear-storage-and-reload', () => {
  console.log('[Hard Refresh] Clearing localStorage and reloading...')

  try {
    // Clear all localStorage data
    localStorage.clear()
    console.log('[Hard Refresh] localStorage cleared')

    // Clear all sessionStorage data
    sessionStorage.clear()
    console.log('[Hard Refresh] sessionStorage cleared')

    // Reload the window
    window.location.reload()
  } catch (error) {
    console.error('[Hard Refresh] Error during refresh:', error)
    // Still try to reload even if clearing fails
    window.location.reload()
  }
})
