import React from 'react'

interface StylizedPointerProps {
  pointerRef: React.RefObject<HTMLDivElement | null>
}

// Ponteiro no topo da roda. O elemento referenciado é animado (balança)
// a cada fatia que passa por ele.
const StylizedPointer: React.FC<StylizedPointerProps> = ({ pointerRef }) => {
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 z-20 w-[10%] -translate-x-1/2 -translate-y-[30%]">
      <div ref={pointerRef} style={{ transformOrigin: '50% 30%' }}>
        <svg
          viewBox="0 0 60 80"
          className="w-full drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="pointer-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: 'rgb(var(--amber-100))' }} />
              <stop
                offset="0.5"
                style={{ stopColor: 'rgb(var(--amber-400))' }}
              />
              <stop offset="1" style={{ stopColor: 'rgb(var(--amber-600))' }} />
            </linearGradient>
          </defs>
          <path
            d="M30 77 L7 30 A25 25 0 1 1 53 30 Z"
            fill="url(#pointer-fill)"
            style={{ stroke: 'rgb(var(--amber-900))' }}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle
            cx="30"
            cy="24"
            r="9"
            style={{ fill: 'rgb(var(--amber-900))' }}
          />
          <circle
            cx="30"
            cy="24"
            r="4"
            style={{ fill: 'rgb(var(--amber-200))' }}
          />
        </svg>
      </div>
    </div>
  )
}

export default StylizedPointer
