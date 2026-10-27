import type { Sprite } from './lib'

// Desenha um sprite de pixel art (ver sprite() em lib.ts): um <svg> com um
// <path> por cor, nítido em qualquer escala inteira.
export const Px = ({ s, className }: { s: Sprite; className?: string }) => (
  <svg
    className={className}
    viewBox={`0 0 ${s.w} ${s.h}`}
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    {s.paths.map(([fill, d]) => (
      <path key={fill} d={d} fill={fill} />
    ))}
  </svg>
)
