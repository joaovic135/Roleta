import type { CSSProperties } from 'react'
import type { Sprite } from './lib'

// Desenha um sprite de pixel art (ver lib.ts): um <svg> com um <path> por
// cor, nítido em qualquer escala.
export const Px = ({
  s,
  className,
  style,
}: {
  s: Sprite
  className?: string
  style?: CSSProperties
}) => (
  <svg
    className={className}
    style={style}
    viewBox={`0 0 ${s.w} ${s.h}`}
    shapeRendering="crispEdges"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    {s.paths.map(([fill, d]) => (
      <path key={fill} d={d} fill={fill} />
    ))}
  </svg>
)
