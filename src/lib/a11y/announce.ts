export function announcePolite(message: string) {
  let node = document.getElementById('a11y-live-region') as HTMLElement | null
  if (!node) {
    node = document.createElement('div')
    node.id = 'a11y-live-region'
    node.setAttribute('aria-live', 'polite')
    node.setAttribute('aria-atomic', 'true')
    node.className = 'sr-only'
    document.body.appendChild(node)
  }
  // clear then set to ensure assistive tech announces repeated messages
  node.textContent = ''
  // small timeout gives DOM time to register
  setTimeout(() => { node!.textContent = message }, 50)
}

export default announcePolite
