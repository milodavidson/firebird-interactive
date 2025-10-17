"use client"

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { trapFocus } from '@/lib/a11y/focusTrap'

type Props = {
  open: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLElement | null>
  videoEmbedUrl: string
}

export default function FirebirdVideoModal({ open, onClose, triggerRef, videoEmbedUrl }: Props) {
  const [mounted, setMounted] = useState(false)
  const [iframeSrc, setIframeSrc] = useState('')
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const prevActive = useRef<Element | null>(null)

  // respect reduced motion preference
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(!!mq && mq.matches)
  }, [])

  useEffect(() => { setMounted(true); return () => setMounted(false) }, [])

  // Lazy load iframe src when opening; unload when closing to stop playback
  useEffect(() => {
    if (open) {
      // small timeout so animation can start before heavy load
      const t = setTimeout(() => setIframeSrc(videoEmbedUrl), 80)
      return () => clearTimeout(t)
    }
    setIframeSrc('')
    return
  }, [open, videoEmbedUrl])

  // focus management: save & restore, and focus close button on open
  useEffect(() => {
    if (open) {
      prevActive.current = document.activeElement
      try { console.debug('[FirebirdVideoModal] saved prevActive', prevActive.current) } catch (e) {}
      // focus the close button when opened
      setTimeout(() => closeRef.current?.focus(), 0)
      // use trapFocus helper on the dialog
      const dialog = dialogRef.current
      if (dialog) {
        const release = trapFocus(dialog)
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        return () => {
          release()
          document.removeEventListener('keydown', onKey)
        }
      }
    } else {
      // restore focus when closed — only if we actually saved a previous active element.
      if (prevActive.current instanceof HTMLElement) {
        try { console.debug('[FirebirdVideoModal] restoring focus to prevActive', prevActive.current) } catch (e) {}
        prevActive.current.focus()
        prevActive.current = null
      }
    }
  }, [open, onClose, triggerRef])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{}} animate={{}} exit={{}}>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="firebird-video-title"
            ref={dialogRef}
            className="relative w-full max-w-3xl max-h-[90vh] rounded-lg border border-gray-200 bg-white shadow-xl p-4 md:p-6 overflow-auto"
            initial={{ opacity: 0, y: 18, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.992 }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: 'easeOut' }}
            style={{ zIndex: 60 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div id="firebird-video-title" className="font-semibold text-lg">Excerpt from <em>The Firebird</em></div>
              <button
                ref={closeRef}
                aria-label="Close video"
                className="text-gray-500 hover:text-gray-700"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 w-full bg-black">
              <div className="aspect-video w-full">
                {iframeSrc ? (
                  <iframe
                    width={560}
                    height={315}
                    src={iframeSrc}
                    title="YouTube video player"
                    frameBorder={0}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="w-full h-full rounded"
                    loading="lazy"
                  />
                ) : (
                  // lightweight placeholder while iframe src is not set
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Loading video…</div>
                )}
              </div>
            </div>

            {/* helper text removed per design */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
