"use client"

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

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
      // focus the close button when opened
      setTimeout(() => closeRef.current?.focus(), 0)
      // trap focus via keydown handler
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'Tab') {
          const dialog = dialogRef.current
          if (!dialog) return
          const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null)
          if (focusable.length === 0) return
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus()
          } else if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus()
          }
        }
      }
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    } else {
      // restore focus when closed
      if (prevActive.current instanceof HTMLElement) {
        prevActive.current.focus()
      } else if (triggerRef && triggerRef.current) {
        // fallback to trigger ref
        (triggerRef.current as HTMLElement).focus()
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
              <div id="firebird-video-title" className="font-semibold text-lg"><em>Firebird</em> clip</div>
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

            <div className="mt-4 text-sm text-gray-600">Click outside, press Esc, or press Close to dismiss.</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
