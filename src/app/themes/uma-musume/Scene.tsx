import type { CSSProperties } from 'react'
import {
  BURST_DOTS,
  BURST_INNER,
  BURST_RAYS,
  CLOUDS,
  CROWD_HAIR,
  FERRIS,
  SKYLINE,
  STAND,
  STAND_ROWS,
  TOWER,
  TRACK,
  TREES,
  circle,
  heart,
  rect,
  seeded,
  sparkle,
  star,
  swag,
} from './geo'
import Jumbotron from './Jumbotron'
import { DashPack, Race, SpriteDefs } from './Runners'

// Cena de fundo do tema Uma Musume (só aparece com data-theme="uma-musume").
// "Grande Prêmio Estrela Doce": um hipódromo de idols vivo, desenhado como
// ilustração de anime em camadas (céu, nuvens em parallax, cidade-doce ao
// longe, pista em perspectiva, torres de refletores, arquibancada) e com um
// jogo rodando nas beiradas, onde a interface deixa ver:
// - faixa de baixo: a reta final. Cinco corredoras originais (garotas-
//   cavalo chibi: Morango Veloz, Nuvem de Algodão, Menta Relâmpago, Pudim
//   Dourado e Céu de Anis) entram trotando no portão de largada (canto de
//   baixo à esquerda), luzes vermelha-vermelha-verde, os portões abrem em
//   CSS 3D e elas disparam até o poste de chegada (canto direito), com
//   ultrapassagens; a vencedora comemora pulando (Runners.tsx, race.ts);
// - faixa de cima: o telão (Jumbotron.tsx), um prisma 3D que gira entre
//   ranking, câmera AO VIVO (a líder correndo; à noite o Winning Live com
//   três idols dançando) e o título do Grande Prêmio; varais de
//   bandeirinhas, sol, nuvens, passarinhos, dirigível-cenoura;
// - laterais: torre de refletores e juiz no pódio (esquerda); arquibancada
//   com torcida de orelhinhas, bandeiras e lightsticks (direita).
//
// Escalas de tempo (theme.css):
// - laços de segundos: passadas (4 quadros), bandeirinhas ao vento,
//   brilhos, lightsticks, telão girando a cada 11 s;
// - eventos de 20–70 s: páreos a cada 72 s (3 histórias, 216 s), câmeras
//   da torcida, pássaros, balão de coração que escapa (130 s);
// - raros (minutos): dirigível-cenoura (190 s), estrela cadente, chuva com
//   arco-íris, fogos do Winning Live, uma vez por ciclo do dia.
// Ciclo do dia (--um-cycle, 240 s): manhã → pancada de chuva + arco-íris →
// tarde dourada → pôr do sol → noite do Winning Live (refletores ligam em
// sequência, holofotes, lightsticks, fogos) → amanhecer com neblina.
// Como os páreos têm 216 s, cada volta do dia vê corridas em horas novas.
//
// Roleta (data-wheel no <html>): girando, entra um pelotão em disparada
// pela reta, a torcida pula, o telão mostra GIRANDO! e os holofotes
// aceleram; no vencedor, o pelotão cruza a chegada e comemora (a primeira
// veste a cor vencedora), o telão mostra 1º LUGAR! na --win-color, uma
// roseta desce, dois canhões soltam confete na cor vencedora e dois
// holofotes convergem no telão; depois fica só um brilho calmo.
//
// Tudo estático aqui; animações só de transform/opacity em theme.css (e
// keyframes gerados em race.ts). Formas iguais viram um <path> por cor e
// os sorteios usam semente fixa. Personagens, nomes e marcas são originais.

const vars = (o: Record<string, string | number>) => o as CSSProperties

const SWAGS = [swag(5, 40), swag(9, 46), swag(13, 44), swag(21, 38)]
const FLAG_COLORS = 6

// passarinhos: duas linhas da folha (asas em fases opostas)
const BIRD_UP = 'q6 -7 12 0q6 -7 12 0'
const BIRD_DOWN = 'q6 5 12 0q6 5 12 0'
const flock = (birds: number[][]) => {
  let d = ''
  birds.forEach(([x, y], i) => {
    const a = i % 2 ? BIRD_DOWN : BIRD_UP
    const b = i % 2 ? BIRD_UP : BIRD_DOWN
    d += `M${x} ${y + 12}${a}M${x} ${y + 62}${b}`
  })
  return d
}
const FLOCKS = [
  {
    top: 15,
    dur: 46,
    delay: -8,
    d: flock([
      [4, 10],
      [34, 20],
      [60, 12],
      [26, 0],
    ]),
  },
  {
    top: 27,
    dur: 62,
    delay: -40,
    d: flock([
      [4, 12],
      [30, 20],
      [54, 6],
    ]),
  },
]

// lightsticks da arquibancada: um <svg> por par de fileiras (HTML anima)
const STICK_COLORS = [
  '#ff8fc8',
  '#7fe3c8',
  '#9ecbff',
  '#ffc27a',
  '#c9a2ff',
  '#fff3a8',
]
const STICK_GROUPS = [0, 1, 2].map((g) => {
  const paths = STICK_COLORS.map(() => '')
  for (const s of STAND.sticks)
    if (Math.floor(s.row / 2) === g)
      paths[s.c] += `M${s.x} ${s.y}l${s.c % 2 ? 2.5 : -2.5} -15`
  return paths
})

// fogos à noite: cantos de cima e laterais
const FIREWORKS = [
  { x: 14, y: 2, size: 15, a: '#ff8fc8', b: '#fff3a8', dur: 3.1, delay: -0.4 },
  { x: 79, y: 1, size: 13, a: '#7fe3c8', b: '#ffffff', dur: 3.6, delay: -2.1 },
  {
    x: 1.5,
    y: 14,
    size: 13,
    a: '#ffd36b',
    b: '#ff8fc8',
    dur: 3.3,
    delay: -1.2,
  },
  { x: 90, y: 18, size: 15, a: '#c9a2ff', b: '#7fe3c8', dur: 3.8, delay: -2.8 },
  { x: 32, y: -2, size: 11, a: '#ff6fae', b: '#ffd36b', dur: 3.5, delay: -0.9 },
  { x: 62, y: -3, size: 12, a: '#9ecbff', b: '#ffffff', dur: 2.9, delay: -1.7 },
]

// pétalas caindo nas laterais
const PETALS = (() => {
  const rand = seeded(91)
  return Array.from({ length: 8 }, (_, i) =>
    vars({
      left: `${(i % 2 ? 90 + rand() * 9 : 0.5 + rand() * 8.5).toFixed(1)}vw`,
      '--um-sway': `${(rand() * 10 - 5).toFixed(1)}vw`,
      '--um-spin': `${Math.round(240 + rand() * 400)}deg`,
      animationDuration: `${(11 + rand() * 8).toFixed(1)}s`,
      animationDelay: `${-(rand() * 19).toFixed(1)}s`,
    }),
  )
})()

// confete do vencedor (canhões nos cantos de baixo, só no 'won')
const cannon = (seed: number, dir: 1 | -1) => {
  const rand = seeded(seed)
  return Array.from({ length: 10 }, (_, i) =>
    vars({
      '--um-dx': `${(dir * (3 + rand() * 18)).toFixed(1)}vw`,
      '--um-dy': `${-(30 + rand() * 34).toFixed(1)}vh`,
      '--um-rot': `${Math.round(dir * (240 + rand() * 520))}deg`,
      animationDelay: `${(rand() * 0.35 + (i % 3) * 0.12).toFixed(2)}s`,
    }),
  )
}
const CANNON_L = cannon(17, 1)
const CANNON_R = cannon(29, -1)

// poste de chegada (viewBox 80×300): mastro listrado + placa redonda
const POLE_STRIPES = Array.from(
  { length: 11 },
  (_, i) => `M36 ${96 + i * 18}l8 -6v8l-8 6z`,
).join('')
const CHECKER = (() => {
  let d = ''
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 6; c++)
      if ((r + c) % 2 === 0) d += rect(1 + c * 6, 1 + r * 6, 6, 6)
  return d
})()

// estrelas do céu noturno (fixas; o CSS só pisca camadas inteiras)
const STARS = (() => {
  const rand = seeded(808)
  let small = ''
  let big = ''
  for (let i = 0; i < 120; i++) {
    const x = rand() * 1600
    const y = rand() * 520
    small += circle(x, y, 0.8 + rand() * 1.1)
  }
  for (let i = 0; i < 18; i++)
    big += sparkle(rand() * 1600, rand() * 420, 4 + rand() * 4)
  return { small, big }
})()

export default function UmaMusumeScene() {
  return (
    <div className="um-scene">
      <SpriteDefs />

      {/* céu: camadas que cruzam a opacidade ao longo do ciclo */}
      <div className="um-sky um-sky-gold" />
      <div className="um-sky um-sky-sunset" />
      <div className="um-sky um-sky-night" />
      <div className="um-sky um-sky-dawn" />
      <div className="um-sky um-sky-rain" />

      {/* noite: estrelas, via-láctea e estrela cadente */}
      <div className="um-night-sky">
        <svg viewBox="0 0 1600 520" preserveAspectRatio="xMidYMin slice">
          <path className="um-star-s" d={STARS.small} />
          <path className="um-star-b" d={STARS.big} />
        </svg>
        <div className="um-twinkle" />
        <div className="um-shooting" />
      </div>
      <div className="um-rainbow" />

      {/* sol (raios e reflexo de lente) e lua girando em arco pelo céu */}
      <div className="um-orbit um-sun-orbit">
        <div className="um-sun">
          <div className="um-sun-halo" />
          <div className="um-sun-rays" />
          <div className="um-sun-disc" />
          <div className="um-flare">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <div className="um-orbit um-moon-orbit">
        <div className="um-moon">
          <svg viewBox="0 0 100 100">
            <path d="M58 8A42 42 0 1 0 94 70A34 34 0 1 1 58 8Z" />
          </svg>
        </div>
      </div>

      {(['far', 'near', 'rain'] as const).map((k) => (
        <div key={k} className={`um-clouds um-clouds-${k}`}>
          <svg viewBox="0 0 3200 220" preserveAspectRatio="none">
            <path className="um-cloud-shade" d={CLOUDS[k].shade} />
            <path className="um-cloud-light" d={CLOUDS[k].light} />
            <path className="um-cloud-rim" d={CLOUDS[k].rim} />
          </svg>
        </div>
      ))}

      {/* passarinhos de dia (cada bando bate as asas em degraus) */}
      <div className="um-birds">
        {FLOCKS.map((f, i) => (
          <div
            key={i}
            className="um-flock"
            style={vars({
              top: `${f.top}vh`,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
            })}
          >
            <div className="um-flock-win">
              <svg viewBox="0 0 90 100" className="um-flock-sheet">
                <path d={f.d} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* raro: dirigível-cenoura com faixa de torcida */}
      <div className="um-blimp">
        <svg viewBox="0 0 260 90">
          <path className="um-bl-banner" d="M150 52h92l-8 9l8 9h-92z" />
          <text className="um-bl-text" x="196" y="65">
            VAI, MORANGO!
          </text>
          <path className="um-bl-rope" d="M134 50L150 56M134 58L150 66" />
          <path
            className="um-bl-leaf"
            d="M118 34q22 -26 30 -10q-12 6 -30 14zM118 40q26 -2 26 16q-14 -2 -26 -10z"
          />
          <path
            className="um-bl-body"
            d="M8 38q0 -26 56 -26q46 0 58 22q4 8 0 14q-12 22 -58 22q-56 0 -56 -32z"
          />
          <path
            className="um-bl-ring"
            d="M40 16q-6 22 0 44M64 13q-6 24 0 50M88 15q-6 22 0 46"
          />
          <path
            className="um-bl-shine"
            d="M22 30q14 -12 40 -12q-30 6 -40 20z"
          />
          <path className="um-bl-gondola" d="M50 68h28l-4 9h-20z" />
          <path
            className="um-bl-win"
            d={rect(55, 70, 4, 3) + rect(62, 70, 4, 3) + rect(69, 70, 4, 3)}
          />
        </svg>
      </div>
      {/* raro: balão de coração que escapa da arquibancada */}
      <div className="um-balloon">
        <svg viewBox="0 0 40 90">
          <path className="um-ba-string" d="M20 40q-6 14 2 26t-2 24" />
          <path className="um-ba-body" d={heart(20, 20, 16)} />
          <path className="um-ba-shine" d="M10 12q4 -6 9 -5q-6 3 -7 9z" />
        </svg>
      </div>

      {/* roda-gigante pastel no horizonte (gira devagar; acende à noite) */}
      <div className="um-ferris">
        <svg className="um-ferris-wheel" viewBox="0 0 300 340">
          <path className="um-fw-spoke" d={FERRIS.spokes} />
          <path className="um-fw-rim" d={FERRIS.rim} />
          {FERRIS.cars.map((d, i) => (
            <path key={i} className={`um-fw-car um-fw-car-${i}`} d={d} />
          ))}
        </svg>
        <svg className="um-ferris-legs" viewBox="0 0 300 340">
          <path className="um-fw-leg" d={FERRIS.legs} />
          <path className="um-fw-hub" d={FERRIS.hub} />
        </svg>
      </div>
      {/* balão de ar quente de sorvete (lateral direita, balança no ar) */}
      <div className="um-icecream">
        <svg viewBox="0 0 80 124">
          <path
            className="um-ic-scoop"
            d="M8 50q-4 -42 32 -44q36 2 32 44q-4 6 -8 2q-4 8 -9 2q-5 7 -10 0q-5 7 -10 0q-5 6 -9 -2q-4 6 -8 0q-6 4 -10 -2z"
          />
          <path
            className="um-ic-sprinkle"
            d="M22 22l5 -3M44 16l4 4M56 30l-5 3M30 38l5 2M18 40l3 -4M48 42l-4 3M36 26l2 -5"
          />
          <path className="um-ic-shine" d="M18 22q6 -10 16 -12q-10 6 -12 16z" />
          <path className="um-ic-cherry" d={circle(40, 6, 5)} />
          <path className="um-ic-stem" d="M40 2q2 -6 8 -6" />
          <path className="um-ic-rope" d="M20 56L30 92M60 56L50 92M40 58V92" />
          <path className="um-ic-cone" d="M26 92h28l-14 30z" />
          <path
            className="um-ic-waffle"
            d="M30 96l12 12M38 94l9 9M28 100l10 10M50 96l-12 12M42 94l-9 9M52 100l-10 10"
          />
        </svg>
      </div>

      {/* fundo: morros, cidade-doce, árvores e a pista em perspectiva */}
      <svg
        className="um-track"
        viewBox="0 0 1600 360"
        preserveAspectRatio="none"
      >
        <path
          className="um-hills-far"
          d="M0 70Q160 30 330 58T640 46T960 60T1280 40T1600 58V360H0Z"
        />
        <path className="um-skyline" d={SKYLINE.d} />
        <path className="um-skyline-win" d={SKYLINE.win} />
        <path
          className="um-hills"
          d="M0 76Q120 52 260 70T560 66T880 74T1200 60T1600 70V360H0Z"
        />
        <path className="um-trees" d={TREES.d} />
        <path className="um-trees-light" d={TREES.light} />
        <path className="um-field" d="M0 84Q800 70 1600 82V360H0Z" />
        <path className="um-outer" d={TRACK.outer} />
        <path className="um-turf" d={TRACK.band} />
        <path className="um-turf-stripes" d={TRACK.stripes} />
        <path className="um-rail-post" d={TRACK.far.posts} />
        <path className="um-rail" d={TRACK.far.bar} />
        <path className="um-rail-post" d={TRACK.near.posts} />
        <path className="um-rail" d={TRACK.near.bar} />
      </svg>
      <div className="um-wet" />
      <div className="um-fog" />

      {/* torres de refletores nas duas laterais */}
      {(['l', 'r'] as const).map((s) => (
        <svg key={s} className={`um-tower um-tower-${s}`} viewBox="0 0 120 740">
          <path className="um-tw-leg" d={TOWER.legs} />
          <path className="um-tw-brace" d={TOWER.braces} />
          <path className="um-tw-box" d={TOWER.box} />
          <path className="um-tw-visor" d={TOWER.visor} />
          <path className="um-tw-lamp" d={TOWER.lamps} />
        </svg>
      ))}

      {/* arquibancada (direita): estrutura, torcida pulando e bandeiras */}
      <div className="um-stand">
        <svg className="um-stand-back" viewBox="0 0 260 600">
          <path className="um-st-wall" d="M0 150H260V600H0Z" />
          <path
            className="um-st-seat"
            d={STAND_ROWS.map((y) => rect(0, y - 2, 260, 30)).join('')}
          />
        </svg>
        <div className="um-crowd">
          <svg viewBox="0 0 260 600">
            {STAND.shirts.map((d, i) => (
              <path key={i} className={`um-st-shirt um-st-shirt-${i}`} d={d} />
            ))}
            <path className="um-st-skin" d={STAND.skin} />
            {STAND.hair.map((d, i) => (
              <path key={i} d={d} style={{ fill: CROWD_HAIR[i] }} />
            ))}
            <path className="um-st-ear" d={STAND.ears} />
            <path className="um-st-ear-in" d={STAND.earIn} />
          </svg>
        </div>
        <svg className="um-stand-front" viewBox="0 0 260 600">
          <path className="um-st-step" d={STAND.steps} />
          <path className="um-st-step-top" d={STAND.stepTop} />
          {/* toldo listrado com babado e colunas */}
          <path
            className="um-st-post"
            d="M8 150h6v300h-6zM126 150h6v300h-6zM246 150h6v300h-6z"
          />
          <path className="um-st-roof" d="M-6 112L130 92L266 112V152H-6Z" />
          <path
            className="um-st-roof-stripe"
            d={Array.from({ length: 10 }, (_, i) =>
              rect(i * 28 - 4, 112, 14, 40),
            ).join('')}
          />
          <path
            className="um-st-scallop"
            d={Array.from({ length: 20 }, (_, i) =>
              circle(i * 14 + 7, 152, 7),
            ).join('')}
          />
          <path
            className="um-st-sign"
            d="M60 60h140a10 10 0 0 1 10 10v16H50V70a10 10 0 0 1 10 -10z"
          />
          <text className="um-st-sign-text" x="130" y="80">
            ESTRELA DOCE
          </text>
          <path className="um-st-heart" d={heart(130, 46, 10)} />
          <path className="um-st-wall-front" d="M0 520H260V600H0Z" />
          <path className="um-st-wall-stripe" d="M0 530H260V538H0Z" />
          <text className="um-st-banner" x="130" y="572">
            ♥ VAI, MENINAS! ♥
          </text>
        </svg>
        {/* bandeirões balançando (HTML: o SVG fica parado por dentro) */}
        {STAND.flags.slice(0, 3).map((f, i) => (
          <div
            key={i}
            className="um-fan-flag"
            style={vars({
              left: `${((f.x / 260) * 100).toFixed(1)}%`,
              top: `${(((f.y - 30) / 600) * 100).toFixed(1)}%`,
              animationDelay: `${-i * 0.7}s`,
            })}
          >
            <svg viewBox="0 0 30 34">
              <path className="um-g-stick" d="M2 33V2" />
              <path
                d="M3 2h24v16H3z"
                style={{ fill: STICK_COLORS[(f.c + i) % 6] }}
              />
              <path className="um-ff-heart" d={heart(15, 10, 4)} />
            </svg>
          </div>
        ))}
      </div>

      {/* poste de chegada (na linha --um-fx) com bandeira quadriculada */}
      <div className="um-goal">
        <svg viewBox="0 0 80 300">
          <ellipse className="um-goal-shadow" cx="40" cy="296" rx="18" ry="4" />
          <path className="um-goal-pole" d="M36 80h8v216h-8z" />
          <path className="um-goal-stripe" d={POLE_STRIPES} />
          <path className="um-goal-disc" d={circle(40, 50, 30)} />
          <path className="um-goal-ring" d={circle(40, 50, 24)} />
          <path className="um-goal-star" d={star(40, 51, 17, 7.5)} />
          <path className="um-goal-cap" d={circle(40, 14, 6)} />
        </svg>
        <div className="um-goal-flag">
          <svg viewBox="0 0 38 26">
            <path className="um-checker-white" d="M1 1h36v24H1z" />
            <path className="um-checker-dark" d={CHECKER} />
          </svg>
        </div>
      </div>

      {/* reta final: grama, cerca interna com balizas de pirulito */}
      <div className="um-strip" />

      {/* tom da luz do ambiente (pôr do sol / noite) sobre o cenário */}
      <div className="um-tint um-tint-warm" />
      <div className="um-tint um-tint-night" />

      {/* luzes da noite (por cima do tom): refletores, poças de luz,
          placa da chegada, lightsticks e flashes da torcida */}
      <div className="um-night-lights">
        <div className="um-flood um-flood-l" />
        <div className="um-flood um-flood-r" />
        <div className="um-pool" />
        <div className="um-ferris um-ferris-lit">
          <svg className="um-ferris-wheel" viewBox="0 0 300 340">
            <path className="um-fw-bulb" d={FERRIS.bulbs} />
          </svg>
        </div>
        <div className="um-goal-glow" />
        <div className="um-sticks">
          {STICK_GROUPS.map((paths, g) => (
            <div key={g} className={`um-stick-row um-stick-row-${g}`}>
              <svg viewBox="0 0 260 600">
                {paths.map((d, i) => (
                  <path key={i} d={d} style={{ stroke: STICK_COLORS[i] }} />
                ))}
              </svg>
            </div>
          ))}
        </div>
      </div>
      <div className="um-flashes">
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={`um-flash-${i}`} />
        ))}
      </div>

      {/* holofotes de palco varrendo o céu à noite */}
      <div className="um-spots">
        <div className="um-spot um-spot-1" />
        <div className="um-spot um-spot-2" />
        <div className="um-spot um-spot-3" />
        <div className="um-spot um-spot-4" />
      </div>
      {/* holofotes rápidos (entram quando a roleta gira) */}
      <div className="um-spots-fast">
        <div className="um-spot um-spot-1" />
        <div className="um-spot um-spot-2" />
      </div>

      {/* fogos de artifício à noite */}
      <div className="um-fireworks">
        {FIREWORKS.map((fw, i) => (
          <svg
            key={i}
            className="um-firework"
            viewBox="0 0 100 100"
            style={vars({
              left: `${fw.x}vw`,
              top: `${fw.y}vh`,
              width: `${fw.size}vh`,
              animationDuration: `${fw.dur}s`,
              animationDelay: `${fw.delay}s`,
            })}
          >
            <path d={BURST_RAYS} style={{ stroke: fw.a }} />
            <path d={BURST_INNER} style={{ stroke: fw.b }} />
            <path d={BURST_DOTS} style={{ stroke: fw.b }} />
          </svg>
        ))}
      </div>

      {/* a corrida (portão, corredoras, portas) e o pelotão da roleta */}
      <Race />
      <DashPack />

      {/* lightsticks da primeira fila, na beirada de baixo (só à noite) */}
      <div className="um-front-sticks">
        <div className="um-fs um-fs-a" />
        <div className="um-fs um-fs-b" />
      </div>

      {/* chuva rápida, respingos e relâmpago */}
      <div className="um-rain">
        <div className="um-rain-a" />
        <div className="um-rain-b" />
        <div className="um-splash" />
      </div>
      <div className="um-flash" />

      {/* varais de bandeirinhas presos ao telão */}
      <div className="um-garland um-garland-l">
        {SWAGS.slice(0, 2).map((s, i) => (
          <div key={i} className={`um-swag um-swag-${i}`}>
            <svg viewBox="0 0 400 100" preserveAspectRatio="none">
              <path className="um-swag-string" d={s.string} />
              {s.flags.slice(0, FLAG_COLORS).map((d, c) => (
                <path key={c} className={`um-f${c}`} d={d} />
              ))}
              <path className="um-swag-shine" d={s.shine} />
            </svg>
          </div>
        ))}
      </div>
      <div className="um-garland um-garland-r">
        {SWAGS.slice(2).map((s, i) => (
          <div key={i} className={`um-swag um-swag-${i + 2}`}>
            <svg viewBox="0 0 400 100" preserveAspectRatio="none">
              <path className="um-swag-string" d={s.string} />
              {s.flags.slice(0, FLAG_COLORS).map((d, c) => (
                <path key={c} className={`um-f${c}`} d={d} />
              ))}
              <path className="um-swag-shine" d={s.shine} />
            </svg>
          </div>
        ))}
      </div>

      <Jumbotron />

      {/* brilhos e pétalas nas bordas */}
      <div className="um-sparkles" />
      <div className="um-petals">
        {PETALS.map((style, i) => (
          <i key={i} style={style} />
        ))}
      </div>

      {/* vencedor: holofotes convergindo no telão e confete na cor dele */}
      <div className="um-converge">
        <div className="um-cv um-cv-l" />
        <div className="um-cv um-cv-r" />
      </div>
      <div className="um-cannon um-cannon-l">
        {CANNON_L.map((style, i) => (
          <i key={i} style={style} />
        ))}
      </div>
      <div className="um-cannon um-cannon-r">
        {CANNON_R.map((style, i) => (
          <i key={i} style={style} />
        ))}
      </div>
    </div>
  )
}
