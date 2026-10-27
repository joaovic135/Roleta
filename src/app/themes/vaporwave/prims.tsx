import { em, n, vars } from './lib'

// Sólidos flutuantes em CSS 3D (preserve-3d): pirâmide em wireframe, cubo
// sólido, esfera de anéis e um toro feito de anéis. Cada sólido é:
//   .vw-prim  (posição + perspectiva + flutuação em translateY)
//   > .vw-boost (giro extra em rotateY, pausado; roda só com a roleta girando)
//   > .vw-turn  (giro próprio, lento)
//   > faces/anéis com transform 3D fixo.
// As faces nunca animam: só os dois invólucros giram.

type Face = { cls?: string; w: number; h: number; t: string; o?: string }

const faceStyle = ({ w, h, t, o }: Face) =>
  vars({
    width: em(w),
    height: em(h),
    left: em(-w / 2),
    top: em(-h / 2),
    transform: t,
    ...(o ? { transformOrigin: o } : {}),
  })

// ---------------------------------------------------------- pirâmide
const PS = 84 // lado da base
const PH = 74 // altura
const PL = Math.hypot(PH, PS / 2) // altura de cada face triangular
const PT = (Math.atan(PS / 2 / PH) * 180) / Math.PI // inclinação da face

const Pyramid = () => (
  <>
    {[0, 1, 2, 3].map((k) => (
      <div
        key={k}
        className="vw-face vw-pyr-face"
        style={vars({
          width: em(PS),
          height: em(PL),
          left: em(-PS / 2),
          top: em(PH / 2 - PL),
          transformOrigin: '50% 100%',
          transform: `rotateY(${k * 90}deg) translateZ(${em(PS / 2)}) rotateX(${n(PT)}deg)`,
        })}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <path className="vw-pyr-fill" d="M50 1L99 99H1Z" />
          <path
            className="vw-pyr-line"
            d="M50 1L99 99H1ZM50 1V99M50 1L25 99M50 1L75 99M37.5 26H62.5M25 50H75M12.5 75H87.5"
          />
        </svg>
      </div>
    ))}
    <div
      className="vw-face vw-pyr-base"
      style={faceStyle({
        w: PS,
        h: PS,
        t: `translateY(${em(PH / 2)}) rotateX(90deg)`,
      })}
    />
  </>
)

// -------------------------------------------------------------- cubo
const CS = 62
const CUBE: Face[] = [
  { cls: 'vw-cube-a', w: CS, h: CS, t: `translateZ(${em(CS / 2)})` },
  {
    cls: 'vw-cube-b',
    w: CS,
    h: CS,
    t: `rotateY(90deg) translateZ(${em(CS / 2)})`,
  },
  {
    cls: 'vw-cube-a',
    w: CS,
    h: CS,
    t: `rotateY(180deg) translateZ(${em(CS / 2)})`,
  },
  {
    cls: 'vw-cube-b',
    w: CS,
    h: CS,
    t: `rotateY(-90deg) translateZ(${em(CS / 2)})`,
  },
  {
    cls: 'vw-cube-c',
    w: CS,
    h: CS,
    t: `rotateX(90deg) translateZ(${em(CS / 2)})`,
  },
  {
    cls: 'vw-cube-c',
    w: CS,
    h: CS,
    t: `rotateX(-90deg) translateZ(${em(CS / 2)})`,
  },
]

const Cube = () => (
  <>
    {CUBE.map((f, i) => (
      <div
        key={i}
        className={'vw-face vw-cube-face ' + f.cls}
        style={faceStyle(f)}
      >
        {i === 0 && <span className="vw-cube-glyph">夢</span>}
      </div>
    ))}
  </>
)

// ------------------------------------------------- esfera de anéis
const SR = 56
const LAT = [-52, -24, 0, 24, 52]
const Sphere = () => (
  <>
    {[0, 30, 60, 90, 120, 150].map((a) => (
      <div
        key={'m' + a}
        className="vw-face vw-ring vw-ring-m"
        style={faceStyle({ w: SR * 2, h: SR * 2, t: `rotateY(${a}deg)` })}
      />
    ))}
    {LAT.map((lat) => {
      const r = SR * Math.cos((lat * Math.PI) / 180)
      const y = -SR * Math.sin((lat * Math.PI) / 180)
      return (
        <div
          key={'l' + lat}
          className="vw-face vw-ring vw-ring-l"
          style={faceStyle({
            w: r * 2,
            h: r * 2,
            t: `translateY(${em(y)}) rotateX(90deg)`,
          })}
        />
      )
    })}
  </>
)

// ------------------------------------------------- toro de anéis
const TR = 40 // raio do anel maior
const Tr = 15 // raio do tubo
const TN = 18
const Torus = () => (
  <>
    {Array.from({ length: TN }, (_, i) => (
      <div
        key={i}
        className="vw-face vw-ring vw-ring-t"
        style={faceStyle({
          w: Tr * 2,
          h: Tr * 2,
          t: `rotateY(${n((i * 360) / TN)}deg) translateX(${em(TR)})`,
        })}
      />
    ))}
  </>
)

const SHAPES = {
  pyr: Pyramid,
  cube: Cube,
  sphere: Sphere,
  torus: Torus,
}

export const Prim = ({ kind }: { kind: keyof typeof SHAPES }) => {
  const Shape = SHAPES[kind]
  return (
    <div className={`vw-prim vw-prim-${kind}`}>
      {kind === 'sphere' && <span className="vw-core" />}
      <div className="vw-boost">
        <div className="vw-turn">
          <Shape />
        </div>
      </div>
    </div>
  )
}
