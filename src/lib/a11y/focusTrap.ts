export function trapFocus(container: HTMLElement) {
  const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(n => n.offsetParent !== null)
  if (nodes.length === 0) {
    // make container focusable as fallback
    container.tabIndex = -1
    container.focus()
  } else {
    nodes[0].focus()
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      // let consumer handle Close via their own handler
      return
    }
    if (e.key !== 'Tab') return
    const focused = document.activeElement as HTMLElement | null
    const idx = nodes.indexOf(focused as HTMLElement)
    if (e.shiftKey) {
      if (idx === 0) {
        e.preventDefault()
        nodes[nodes.length - 1].focus()
      }
    } else {
      if (idx === nodes.length - 1) {
        e.preventDefault()
        nodes[0].focus()
      }
    }
  }

  container.addEventListener('keydown', handleKey)
  return function release() {
    container.removeEventListener('keydown', handleKey)
  }
}

export default trapFocus
