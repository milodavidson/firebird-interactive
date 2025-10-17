export function trapFocus(container: HTMLElement) {
  const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

  // helper to collect currently focusable nodes inside the container
  function getFocusableNodes() {
    try {
      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(n => n.offsetParent !== null)
    } catch (e) {
      return [] as HTMLElement[]
    }
  }

  // Ensure something inside the container is focused on activation
  const initialNodes = getFocusableNodes()
  let previousTabAttr: string | null = null
  if (initialNodes.length === 0) {
    // make container focusable as fallback and remember previous tabindex
    previousTabAttr = container.getAttribute('tabindex')
    container.tabIndex = -1
    container.focus()
  } else {
    initialNodes[0].focus()
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      // let consumer handle Close via their own handler
      return
    }
    if (e.key !== 'Tab') return

    // Recompute focusable nodes each Tab so we handle dynamically added/removed focusables and portal content
    const nodes = getFocusableNodes()
    if (nodes.length === 0) {
      // nothing focusable, keep focus on container
      e.preventDefault()
      container.focus()
      return
    }

    const focused = document.activeElement as HTMLElement | null
    let idx = nodes.indexOf(focused as HTMLElement)
    // If focused element is not within our list, attempt to find the nearest by containment
    if (idx === -1 && focused && container.contains(focused)) {
      // try to find the first focusable that comes after focused in DOM order
      idx = nodes.findIndex(n => n.compareDocumentPosition(focused) & Node.DOCUMENT_POSITION_FOLLOWING)
      if (idx === -1) idx = 0
    }

    if (e.shiftKey) {
      if (idx <= 0) {
        e.preventDefault()
        nodes[nodes.length - 1].focus()
      }
    } else {
      if (idx === -1 || idx >= nodes.length - 1) {
        e.preventDefault()
        nodes[0].focus()
      }
    }
  }

  // Attach at document level to reliably capture Tab regardless of which element has focus
  document.addEventListener('keydown', handleKey)
  return function release() {
    document.removeEventListener('keydown', handleKey)
    // restore previous tabindex if we changed it
    if (previousTabAttr == null) {
      // If there was no previous attribute, remove the attribute we set
      try { container.removeAttribute('tabindex') } catch {}
    } else {
      try { container.setAttribute('tabindex', previousTabAttr) } catch {}
    }
  }
}

export default trapFocus
