// Sólidos Memphis em CSS 3D: cubo, pirâmide e prisma com faces estampadas
// (bolinhas, listras, xadrez, rabisco) e contorno preto. Cada sólido tem um
// gêmeo todo em tinta, deslocado para baixo e para a direita: é a sombra
// dura do pôster, que gira junto (mesma animação, mesmo atraso).
// Camadas (de fora para dentro):
//   .gt-solid      posição e flutuação lenta (sobe e desce)
//   .gt-solid-hop  pulinho único quando a roleta para (won)
//   .gt-view       perspectiva; a sombra é um .gt-view deslocado
//   .gt-whirl      giro extra por transição enquanto a roleta gira
//   .gt-tumble     giro contínuo e lento do sólido (preserve-3d)
//   faces          estáticas, posicionadas em 3D

type Kind = 'cube' | 'pyramid' | 'prism'

// sem a face de baixo nem a base da pirâmide: a câmera olha sempre de
// cima e o giro extra da roleta é só em Y, então elas nunca aparecem
const CUBE_FACES = [
  'gt-p-dots',
  'gt-p-stripes',
  'gt-p-check',
  'gt-p-squig',
  'gt-p-grid',
]
const PYR_FACES = ['gt-p-stripes', 'gt-p-dots', 'gt-p-zig', 'gt-p-check']
const PRISM_FACES = ['gt-p-squig', 'gt-p-check', 'gt-p-dots']

// Triângulo das faces da pirâmide: o contorno vem num SVG por cima (o
// clip-path corta a borda de CSS)
const TriEdge = () => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path d="M50 1.5L98.5 98.5H1.5Z" />
  </svg>
)
const CapEdge = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path
      d={flip ? 'M98.5 1.5L1.5 50L98.5 98.5Z' : 'M1.5 1.5L98.5 50L1.5 98.5Z'}
    />
  </svg>
)

const Faces = ({ kind, ink }: { kind: Kind; ink: boolean }) => {
  if (kind === 'cube')
    return CUBE_FACES.map((p, i) => (
      <i key={i} className={`gt-f gt-cf${i} ${ink ? '' : p}`} />
    ))
  if (kind === 'pyramid')
    return (
      <>
        {PYR_FACES.map((p, i) => (
          <i key={i} className={`gt-f gt-tri gt-pf${i} ${ink ? '' : p}`}>
            {!ink && <TriEdge />}
          </i>
        ))}
      </>
    )
  return (
    <>
      {PRISM_FACES.map((p, i) => (
        <i key={i} className={`gt-f gt-rf${i} ${ink ? '' : p}`} />
      ))}
      <i className={`gt-f gt-cap gt-cap-r ${ink ? '' : 'gt-p-yellow'}`}>
        {!ink && <CapEdge />}
      </i>
      <i className={`gt-f gt-cap gt-cap-l ${ink ? '' : 'gt-p-yellow'}`}>
        {!ink && <CapEdge flip />}
      </i>
    </>
  )
}

export const Solid = ({
  kind,
  className,
}: {
  kind: Kind
  className: string
}) => (
  <div className={`gt-solid gt-${kind} ${className}`}>
    <div className="gt-solid-hop">
      <div className="gt-view gt-view-ink">
        <div className="gt-whirl">
          <div className="gt-tumble">
            <Faces kind={kind} ink />
          </div>
        </div>
      </div>
      <div className="gt-view">
        <div className="gt-whirl">
          <div className="gt-tumble">
            <Faces kind={kind} ink={false} />
          </div>
        </div>
      </div>
    </div>
  </div>
)
