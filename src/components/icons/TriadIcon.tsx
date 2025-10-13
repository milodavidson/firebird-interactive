import * as React from 'react'

export type TriadIconProps = React.SVGProps<SVGSVGElement>

// A simple triad: three noteheads in a chord-like arrangement with a shared stem
export function TriadIcon({ className, ...props }: TriadIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Noteheads */}
      <circle cx="8" cy="15" r="2" />
      <circle cx="12" cy="11" r="2" />
      <circle cx="16" cy="15" r="2" />
      {/* Shared stem on the right */}
      <line x1="18" y1="6.5" x2="18" y2="15" />
    </svg>
  )
}

export default TriadIcon
