import { TOWERS } from './geo'
import { cx, vars } from './City'

// Personagens e máquinas da cidade. Cada um que se mexe é um elemento
// HTML próprio (ou o <svg> externo), animado só com transform/opacity.

// ---- carpa holográfica (tancho: mancha vermelha na cabeça) -----------------
const KOI_BODY =
  'M192 40C190 30 178 22 160 20C136 17 108 18 86 24C66 29 50 34 36 37L30 38V44L36 45C52 49 70 55 92 58C116 61 146 61 164 58C180 55 191 49 192 40Z'
const KOI_FINS =
  'M128 19C120 6 100 1 76 7C84 13 88 19 90 23Z' +
  'M150 58C151 70 141 78 127 80C133 72 137 64 139 59Z' +
  'M104 59C102 68 94 72 85 73C91 67 95 62 97 59Z' +
  'M64 52C60 58 54 62 45 63C51 58 55 54 57 50Z'
const KOI_LINES =
  'M160 23C151 32 151 47 160 56' +
  'M188 46C186 52 181 55 176 57M184 47C182 51 178 53 174 53' +
  'M150 40C126 39 96 40 44 41'
const KOI_TAIL =
  'M70 37C56 30 40 14 18 4C24 16 30 28 30 40C30 52 24 64 18 76C40 66 56 50 70 45Z'
const KOI_RAYS = 'M68 40L24 9M68 40L28 24M68 40L30 40M68 40L28 56M68 40L24 71'

export function Koi() {
  return (
    <div className="cy-koi">
      <div className="cy-koi-whirl">
        <div className="cy-koi-bob">
          <div className="cy-koi-pitch">
            <svg
              className="cy-koi-aura"
              viewBox="0 0 200 80"
              aria-hidden="true"
            >
              <path d={KOI_BODY + KOI_FINS} />
            </svg>
            <svg className="cy-koi-tail" viewBox="0 0 70 80" aria-hidden="true">
              <path className="cy-koi-fill" d={KOI_TAIL} />
              <path className="cy-koi-line" d={KOI_RAYS} />
            </svg>
            <svg
              className="cy-koi-body"
              viewBox="0 0 200 80"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="cy-koi-g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#7ffcff" stopOpacity="0.55" />
                  <stop offset="0.6" stopColor="#00c8ff" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#8a5cff" stopOpacity="0.32" />
                </linearGradient>
                <pattern
                  id="cy-koi-scan"
                  width="4"
                  height="3"
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    width="4"
                    height="1.2"
                    fill="#e8ffff"
                    fillOpacity="0.32"
                  />
                </pattern>
              </defs>
              <path className="cy-koi-fin" d={KOI_FINS} />
              <path fill="url(#cy-koi-g)" d={KOI_BODY} />
              <path fill="url(#cy-koi-scan)" d={KOI_BODY} />
              <ellipse
                className="cy-koi-spot"
                cx="161"
                cy="27"
                rx="11"
                ry="6.5"
              />
              <path className="cy-koi-line" d={KOI_LINES} />
              <path className="cy-koi-edge" d={KOI_BODY} />
              <circle className="cy-koi-eye" cx="173" cy="34" r="2.6" />
            </svg>
            <div className="cy-koi-rgb">
              <svg
                className="cy-koi-ghost cy-koi-m"
                viewBox="0 0 200 80"
                aria-hidden="true"
              >
                <path d={KOI_BODY} />
              </svg>
              <svg
                className="cy-koi-ghost cy-koi-y"
                viewBox="0 0 200 80"
                aria-hidden="true"
              >
                <path d={KOI_BODY} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- holofotes da agulha + faísca do raio ----------------------------------
export function Spire() {
  return (
    <div className="cy-spire">
      <div className="cy-beams">
        <div className="cy-sl-wrap">
          <i className="cy-sl cy-sl-a" />
          <i className="cy-sl cy-sl-b" />
        </div>
      </div>
      <i className="cy-spark" />
    </div>
  )
}

// ---- holofotes de rua: só aparecem na vitória, girando de fora para dentro
// até se cruzarem acima da roleta (transição, sem laço)
export function GroundLights() {
  return (
    <>
      <div className="cy-gsl cy-gsl-l">
        <i className="cy-gsl-beam" />
      </div>
      <div className="cy-gsl cy-gsl-r">
        <i className="cy-gsl-beam" />
      </div>
    </>
  )
}

// ---- drones: corpo, luzes, cone de holofote e o cone "mirado" da vitória --
function Drone({ cls, police }: { cls: string; police?: boolean }) {
  return (
    <div className={cx('cy-drone', cls)}>
      <div className="cy-cone-wrap">
        <i className="cy-cone" />
      </div>
      <i className="cy-cone-win" />
      <svg className="cy-drone-svg" viewBox="0 0 60 24" aria-hidden="true">
        <path
          className="cy-drone-body"
          d="M18 9H42L46 14H14ZM26 14H34L32 19H28Z"
        />
        <path className="cy-drone-rotor" d="M4 6H22M38 6H56M12 6V10M48 6V10" />
      </svg>
      {police ? (
        <>
          <i className="cy-pol cy-pol-r" />
          <i className="cy-pol cy-pol-b" />
        </>
      ) : (
        <i className="cy-nav" />
      )}
    </div>
  )
}

export function Drones() {
  return (
    <>
      <Drone cls="cy-drone-top" />
      <Drone cls="cy-drone-l" />
      <Drone cls="cy-drone-r" />
      <Drone cls="cy-police" police />
    </>
  )
}

// ---- trilho elevado e maglev -----------------------------------------------
export function Track() {
  return (
    <>
      <div className="cy-track" />
      <div className="cy-train">
        <i className="cy-tcar" />
        <i className="cy-tcar" />
        <i className="cy-tcar" />
        <i className="cy-tcar cy-tcar-head" />
      </div>
    </>
  )
}

// ---- rua: barraca de lamen sob o trilho, pedestres de guarda-chuva LED,
// bueiros soltando vapor
const WALKERS = [
  { c: '#00f0ff', dur: 64, delay: -12, rev: false, s: 1 },
  { c: '#ff3da6', dur: 83, delay: -51, rev: true, s: 0.9 },
  { c: '#fcee0a', dur: 71, delay: -33, rev: false, s: 0.94 },
  { c: '#b48cff', dur: 97, delay: -74, rev: true, s: 1.06 },
]

function Stall() {
  return (
    <div className="cy-stall">
      <svg viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="cy-stall-in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffcf7a" />
            <stop offset="1" stopColor="#ff7a2e" />
          </linearGradient>
        </defs>
        <rect x="8" y="22" width="184" height="62" fill="url(#cy-stall-in)" />
        {/* clientes no balcão (silhuetas contra a luz) */}
        <path
          className="cy-stall-dark"
          d="M40 84V64C40 56 46 52 52 52C58 52 62 56 62 64V84ZM47 50a6 6 0 1 0 0.1 0zM120 84V66C120 59 125 55 131 55C137 55 141 59 141 66V84ZM127 53a5.5 5.5 0 1 0 0.1 0z"
        />
        <path
          className="cy-stall-dark"
          d="M0 84H200V100H0ZM2 6H198L190 22H10ZM6 22H14V84H6ZM186 22H194V84H186Z"
        />
        {/* noren: cortinas com ラーメン */}
        <path
          className="cy-stall-noren"
          d="M22 22H58V44H22ZM62 22H98V44H62ZM102 22H138V44H102ZM142 22H178V44H142Z"
        />
        <text className="cy-stall-kana" x="40" y="38">
          ラ
        </text>
        <text className="cy-stall-kana" x="80" y="38">
          ー
        </text>
        <text className="cy-stall-kana" x="120" y="38">
          メ
        </text>
        <text className="cy-stall-kana" x="160" y="38">
          ン
        </text>
        <path className="cy-stall-neon" d="M2 6H198" />
        <path className="cy-stall-steam" d="M70 84h60v3H70z" />
      </svg>
      <div className="cy-lanterns">
        <i />
        <i />
      </div>
      <div className="cy-vent cy-vent-stall">
        <i />
        <i />
      </div>
    </div>
  )
}

export function Street() {
  return (
    <>
      <div className="cy-street" />
      <Stall />
      <div className="cy-walkers">
        {WALKERS.map((w, i) => (
          <div
            key={i}
            className={cx('cy-walker', w.rev && 'cy-walker-rev')}
            style={vars({
              '--cy-c': w.c,
              '--cy-s': w.s,
              animationDuration: `${w.dur}s`,
              animationDelay: `${w.delay}s`,
            })}
          >
            <i className="cy-umb" />
            <i className="cy-person" />
          </div>
        ))}
      </div>
      <div className="cy-vent cy-vent-a">
        <i />
        <i />
      </div>
      <div className="cy-vent cy-vent-b">
        <i />
        <i />
      </div>
    </>
  )
}

// ---- gato no beiral da torre da direita (olhos acesos, rabo inquieto) ----
const LEDGE_R = TOWERS[1].ledge

export function Cat() {
  return (
    <div className="cy-cat" style={vars({ '--cy-y': LEDGE_R })}>
      <i className="cy-cat-tail" />
      <svg viewBox="0 0 30 34" aria-hidden="true">
        <path d="M4 34C3 26 5 19 10 15L9 6L13 10H18L21 5L21 15C25 19 27 26 26 34Z" />
      </svg>
      <i className="cy-cat-eyes" />
    </div>
  )
}

// ---- dirigível com letreiro corrido (evento raro, ~a cada 2,5 min) -------
const TICKER =
  'NEO-SAMPA 2088 · GAROA ÁCIDA 97% · TRÂNSITO AÉREO LENTO NA MARGINAL · SORTEIO DA NOITE: GIRE A ROLETA · '

export function Ship() {
  return (
    <div className="cy-ship">
      <svg className="cy-ship-hull" viewBox="0 0 240 64" aria-hidden="true">
        <path
          className="cy-ship-body"
          d="M10 28C10 14 60 4 122 4C186 4 228 16 232 28C228 40 186 52 122 52C60 52 10 42 10 28Z"
        />
        <path
          className="cy-ship-fin"
          d="M22 22L2 6H16L36 20ZM22 34L2 50H16L36 36Z"
        />
        <path className="cy-ship-body" d="M96 50H150L144 60H104Z" />
        <path
          className="cy-ship-rim"
          d="M30 14C60 6 100 4 122 4C170 4 214 12 230 24"
        />
        <path
          className="cy-ship-win"
          d="M108 54h4v3h-4zM118 54h4v3h-4zM128 54h4v3h-4zM138 54h4v3h-4z"
        />
      </svg>
      <div className="cy-ship-scr">
        <span>
          {TICKER}
          {TICKER}
        </span>
      </div>
      <i className="cy-ship-nav" />
    </div>
  )
}
