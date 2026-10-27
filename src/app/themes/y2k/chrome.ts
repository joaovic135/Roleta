import { WheelPhase, wheelPhase } from '../_kit/wheel'

// Metal líquido do tema Y2K: gotas de cromo (metaballs 2D) moldurando a
// tela, desenhadas por um fragment shader (ShaderCanvas do kit).
//
// Campo: soma de r²/d² de cada gota; a superfície é o nível 1. A altura
// h = sqrt(1 - 1/F) vira uma calota perfeita numa gota isolada e um
// "pescoço" líquido quando duas se encontram. A normal sai do gradiente
// analítico do campo (sem derivadas de tela), o anti-serrilhado da borda
// usa a distância estimada (F - 1) / |∇F|.
// Cromo: reflexo de um ambiente falso (céu em cima, fio de luz no
// horizonte, chão escuro embaixo) com as cores da hora do dia, janela de
// brilho "Aero", especular forte e filme fino iridescente nas bordas
// (fresnel). Fora das gotas: sombra suave de dia e halo neon à noite;
// brilhos ✦ curtos no ponto de luz de cada gota.
//
// Quem é quem: 4 âncoras nos cantos, 8 viajantes andando pela moldura em
// sentidos opostos (fundem ao se cruzar e se separam), 3 satélites que
// desgrudam da gota-mãe e voltam, e a GOTINHA, a gota mascote com olhos
// (piscam, olham a roleta, rodam no giro, sorriem na vitória e na virada,
// arregalam no bug), que mora na margem direita e dá pulinhos a cada 37 s.
//
// Roleta: girando, todas correm em volta da moldura (posição integrada,
// sem saltos) e os satélites rodopiam; a Gotinha corre junto e depois
// termina a volta com calma até a casa dela. Vencedor: duas ondas saem da
// roda e incham as gotas, lampejo iridescente na cor da fatia que decai em
// ~3 s e fica um brilho calmo (halo e reflexo tingidos) enquanto o
// resultado estiver aberto. Virada do milênio: pulsam juntas em arco-íris;
// bug: falha digital em fatias (3 trocas por segundo, só nas gotas).
//
// Todo o movimento é calculado aqui no JS (16 gotas, barato) e chega ao
// shader como uniforms; o shader só pinta. O tempo vem do laço do kit
// (window.__sceneTime nas capturas), então cada instante é reproduzível.

// ---- relógio do ciclo (o mesmo de theme.css: --y2-cycle e --y2-t0) ----
export const CYCLE = 240
export const T0 = 0.05
// quadro parado (movimento reduzido): pôr do sol holográfico, τ = 0,40
export const STILL = (0.4 - T0) * CYCLE
const V_AT = 0.625 // virada do milênio (contagem chega a 00:00)
const BUG_AT = 0.66 // bug do milênio (relógio volta para 1900)

export const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform vec4 u_b[16];
uniform vec3 u_skyA;
uniform vec3 u_skyB;
uniform vec3 u_ground;
uniform vec3 u_halo;
uniform vec3 u_winCol;
uniform vec4 u_fx;
uniform vec4 u_k;
uniform float u_night;
uniform vec4 u_eye;

float hash(float n) { return fract(sin(n * 12.9898) * 43758.5453); }

vec3 envMap(vec3 r) {
  float e = -r.y + 0.16 * r.x + 0.05 * sin(r.x * 3.0 + u_k.x);
  vec3 sky = mix(u_skyB, u_skyA, smoothstep(0.0, 0.75, e));
  sky = mix(sky, vec3(1.0), 0.65 * exp(-max(e, 0.0) * 9.0));
  // chão: escuro rente ao horizonte, prateando para perto
  vec3 gnd = mix(u_ground, mix(u_ground, u_skyB, 0.62), smoothstep(-0.02, -0.85, e));
  vec3 c = e > 0.0 ? sky : gnd;
  c += 0.7 * smoothstep(0.035, 0.0, abs(e - 0.015));
  return c;
}

float star(vec2 d) {
  d = abs(d);
  float s = max(0.0, 1.0 - d.x) * max(0.0, 1.0 - d.y * 10.0);
  s += max(0.0, 1.0 - d.y) * max(0.0, 1.0 - d.x * 10.0);
  return s + max(0.0, 1.0 - length(d) * 3.5);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_res.y;
  float px = 1.0 / u_res.y;
  if (u_fx.w > 0.0) {
    float j = hash(floor(p.y * 28.0) + u_k.w * 7.0);
    p.x += (j - 0.5) * 0.05 * u_fx.w * step(0.55, j);
  }

  float F = 0.0;
  vec2 G = vec2(0.0);
  float gs = 0.0;
  for (int i = 0; i < 16; i++) {
    vec4 b = u_b[i];
    vec2 d = p - b.xy;
    float q = dot(d, d) + 1e-5;
    float f = b.z * b.z / q;
    F += f;
    G -= (2.0 * f / q) * d;
    if (b.w > 0.01) {
      vec2 g = d + b.z * vec2(0.3, 0.36);
      gs += star(g / (0.03 + 0.05 * b.w)) * b.w;
    }
  }
  if (F < 0.12 && gs < 0.003) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float gm = max(length(G), 1e-4);
  float a = clamp((F - 1.0) / gm / (px * 1.4) + 0.5, 0.0, 1.0);

  // fora: sombra (dia) + halo aditivo (noite, giro, vitória)
  float Fs = F - dot(G, vec2(0.012, 0.022));
  float shade = smoothstep(0.3, 1.0, Fs) * 0.17 * (1.0 - u_night);
  vec3 haloC = mix(u_halo, u_winCol, clamp(u_fx.z * 0.7 + u_fx.y, 0.0, 1.0));
  float haloK = 0.07 + 0.5 * u_night + 0.22 * u_fx.x + 0.6 * u_fx.y
    + 0.18 * u_fx.z + 0.45 * u_k.z;
  vec4 under = vec4(haloC * smoothstep(0.2, 1.0, F) * haloK, shade);

  vec3 col = vec3(0.0);
  if (a > 0.0) {
    float h = sqrt(max(1.0 - 1.0 / max(F, 1.0), 0.0));
    vec2 gh = G * (0.04 / max(h, 0.035) / (F * F));
    gh += 0.05 * vec2(sin(p.y * 17.0 + u_k.x), sin(p.x * 15.0 - u_k.x));
    vec3 n = normalize(vec3(-gh, 1.0));
    vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
    col = envMap(r);
    vec3 L = normalize(vec3(-0.42, -0.58, 0.7));
    float sp = dot(r, L);
    col += smoothstep(0.972, 0.986, sp) * 0.8 + pow(max(sp, 0.0), 90.0) * 0.7;
    col += 0.35 * pow(max(dot(r, normalize(vec3(0.6, 0.5, 0.62))), 0.0), 28.0)
      * vec3(1.0, 0.75, 0.95);
    // filme fino iridescente (fresnel nas bordas)
    float fres = pow(1.0 - n.z, 2.0);
    float th = 1.7 * (1.0 - n.z) + 0.55 * (p.x * 0.9 + p.y * 1.4) + u_k.y;
    vec3 ir = 0.5 + 0.5 * cos(6.2832 * (th + vec3(0.0, 0.33, 0.67)));
    ir = mix(vec3(1.0), ir, 0.72);
    float irK = 0.6 + 0.35 * u_fx.x + 0.9 * u_fx.y + 0.8 * u_k.z;
    col = mix(col, col * 0.4 + ir * 0.75, clamp(fres * irK, 0.0, 1.0));
    // vitória: lampejo e brilho calmo na cor da fatia
    float tint = (0.45 * u_fx.y + 0.13 * u_fx.z) * (0.35 + 0.65 * fres);
    col = mix(col, u_winCol * 1.15 + 0.08, tint);
    // Gotinha, a gota mascote (u_b[6]): olhos que piscam, olham a roleta,
    // seguem o giro e viram sorriso na vitória; bochechas rosadas
    vec4 m = u_b[6];
    vec2 e = (p - m.xy) / max(m.z, 1e-4);
    if (m.z > 0.02 && dot(e, e) < 1.2) {
      vec2 q = vec2(abs(e.x) - 0.3, e.y + 0.06) - u_eye.yz;
      float oval = length(q / vec2(0.13, 0.2 * max(u_eye.x, 0.06)));
      float eye = 1.0 - smoothstep(0.78, 1.0, oval);
      float arc = abs(length(q - vec2(0.0, 0.07)) - 0.12);
      float hap = (1.0 - smoothstep(0.02, 0.045, arc)) * step(q.y, 0.05);
      eye = mix(eye, hap, u_eye.w);
      float hl = 1.0 - smoothstep(0.022, 0.045, length(q - vec2(-0.04, -0.075)));
      hl *= (1.0 - u_eye.w) * step(0.35, u_eye.x);
      vec2 ck = (e - vec2(sign(e.x) * 0.52, 0.22)) / vec2(1.0, 0.62);
      float blush = 1.0 - smoothstep(0.04, 0.13, length(ck));
      col = mix(col, vec3(1.0, 0.5, 0.78), blush * 0.5);
      col = mix(col, vec3(0.04, 0.07, 0.2), eye);
      col = mix(col, vec3(1.0), hl);
    }
  }
  vec4 o = vec4(col * a, a) + under * (1.0 - a);
  o += vec4(vec3(gs), gs * 0.85);
  gl_FragColor = min(o, vec4(1.0));
}
`

// ---- cores refletidas ao longo do dia (acompanham os céus do CSS) ----
type Rgb = [number, number, number]
const rgb = (hex: string): Rgb => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
]
// zênite, horizonte, chão, halo, "noite" (0..1)
type Mood = [Rgb, Rgb, Rgb, Rgb, number]
const mood = (a: string, b: string, g: string, h: string, n: number): Mood => [
  rgb(a),
  rgb(b),
  rgb(g),
  rgb(h),
  n,
]
const MOOD_KEYS = ['u_skyA', 'u_skyB', 'u_ground', 'u_halo']
const SILVER = mood('#87abd8', '#ffffff', '#5a6d92', '#ffffff', 0)
const DAY = mood('#2f86f0', '#eef8ff', '#3a578a', '#cdeeff', 0)
const SUNSET = mood('#7458dc', '#ffe0f0', '#6b3d86', '#ffb6e6', 0.25)
const NIGHT = mood('#2446b0', '#8fe6ff', '#040a26', '#4fd8ff', 1)
const DAWN = mood('#9d97ee', '#fff2e2', '#6f6093', '#ffd3ea', 0.15)
const MOODS: [number, Mood][] = [
  [0, SILVER],
  [0.03, SILVER],
  [0.14, DAY],
  [0.27, DAY],
  [0.39, SUNSET],
  [0.45, SUNSET],
  [0.55, NIGHT],
  [0.8, NIGHT],
  [0.87, DAWN],
  [0.93, DAWN],
  [1, SILVER],
]

// ---- gotas ----
// Pista: retângulo na faixa das margens (cantos, cabeçalho, rodapé);
// d = distância percorrida no sentido horário a partir do canto de cima
// à esquerda. Âncoras moram nos cantos, viajantes andam pela pista (umas
// num sentido, outras no outro: quando se cruzam, fundem e se separam) e
// satélites orbitam uma gota-mãe, desgrudando e voltando.
type Kind = 0 | 1 | 2 | 3
type Drop = {
  k: Kind // 0 âncora (canto), 1 viajante, 2 satélite, 3 mascote
  at: number // âncora: canto 0..3 | viajante: fração da pista | satélite: mãe
  v: number // viajante: velocidade (uv/s, + horário)
  r: number // raio (× unidade U)
  w: number // respiração (rad/s)
  p: number // fase
  tw: number // ritmo do brilho ✦ (rad/s; 0 = sem brilho)
}
const D = (
  k: Kind,
  at: number,
  v: number,
  r: number,
  w: number,
  p: number,
  tw: number,
): Drop => ({ k, at, v, r, w, p, tw })
const DROPS: Drop[] = [
  D(0, 0, 0, 1.15, 0.21, 0.4, 0.31),
  D(0, 1, 0, 1.05, 0.17, 2.1, 0.43),
  D(0, 2, 0, 1.3, 0.19, 4.0, 0.27),
  D(0, 3, 0, 1.12, 0.23, 5.2, 0.37),
  D(1, 0.08, 0.021, 0.74, 0.37, 1.0, 0.52),
  D(1, 0.2, -0.016, 0.6, 0.41, 2.6, 0.29),
  D(3, 0, 0, 0.92, 0.33, 3.3, 0),
  D(1, 0.47, -0.024, 0.56, 0.45, 0.2, 0.34),
  D(1, 0.6, 0.018, 0.78, 0.35, 4.4, 0.41),
  D(1, 0.71, -0.013, 0.64, 0.39, 1.7, 0.23),
  D(1, 0.84, 0.028, 0.52, 0.43, 5.9, 0.38),
  D(1, 0.93, -0.019, 0.7, 0.31, 3.9, 0.49),
  D(2, 1, 0, 0.36, 0.29, 0.9, 0),
  D(2, 3, 0, 0.33, 0.24, 2.8, 0),
  D(2, 8, 0, 0.3, 0.33, 4.7, 0),
  D(2, 9, 0, 0.34, 0.27, 1.3, 0),
]

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}
const fract = (x: number) => x - Math.floor(x)

// cor CSS (#rgb, #rrggbb, rgb()) → 0..1
const parseColor = (s: string, out: number[]) => {
  s = s.trim()
  let m = /^#([0-9a-f]{3})$/i.exec(s)
  if (m) s = '#' + [...m[1]].map((c) => c + c).join('')
  m = /^#([0-9a-f]{6})/i.exec(s)
  if (m) {
    out[0] = parseInt(m[1].slice(0, 2), 16) / 255
    out[1] = parseInt(m[1].slice(2, 4), 16) / 255
    out[2] = parseInt(m[1].slice(4, 6), 16) / 255
    return
  }
  m = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(s)
  if (m) for (let i = 0; i < 3; i++) out[i] = +m[i + 1] / 255
}

// Monta a função de uniforms (chamada a cada quadro pelo ShaderCanvas).
// Nada é alocado por quadro: o mesmo objeto e os mesmos arrays são
// reescritos.
export function createChrome() {
  const balls = DROPS.map(() => [0, 0, 0, 0])
  const U: Record<string, number | number[]> = {
    u_skyA: [0, 0, 0],
    u_skyB: [0, 0, 0],
    u_ground: [0, 0, 0],
    u_halo: [0, 0, 0],
    u_winCol: [1, 0.5, 0.85],
    u_fx: [0, 0, 0, 0],
    u_k: [0, 0, 0, 0],
    u_night: 0,
    u_eye: [1, 0, 0, 0],
  }
  balls.forEach((b, i) => (U[`u_b[${i}]`] = b))

  // geometria da tela (relida só quando a janela muda de tamanho)
  const view = { A: 16 / 9, U: 0.1, xl: 0.07, calm: [0, 0, 0, 0], wx: 0.8 }
  const measure = () => {
    const w = Math.max(window.innerWidth, 1)
    const h = Math.max(window.innerHeight, 1)
    const left = Math.max(16, (w - 1568) / 2)
    const margin = left / h
    const A = w / h
    view.A = A
    view.xl = Math.min(Math.max(margin * 0.42, 0.012), 0.3)
    // gotas maiores onde há margem; menores em tela em pé (celular)
    const portrait = Math.min(Math.max((A - 0.45) / 0.9, 0), 1)
    view.U =
      Math.min(Math.max(0.05 + margin * 0.24, 0.054), 0.115) *
      (0.62 + 0.38 * portrait)
    // título "ROLETA" + subtítulo: as gotas encolhem ao passar por trás
    view.calm[0] = (left - 20) / h
    view.calm[1] = -1
    view.calm[2] = (left + 380) / h
    view.calm[3] = (w < 640 ? 100 : 96) / h
    // centro da roleta (origem da onda da vitória)
    view.wx = w < 1024 ? A / 2 : (left + 114 + 24 + 483) / h
  }
  measure()
  window.addEventListener('resize', measure)

  // pista
  const lens = [0, 0, 0, 0]
  let per = 1
  const track = (dist: number, out: number[]) => {
    const yt = -0.014
    const yb = 1.016
    const xl = view.xl
    const xr = view.A - xl
    lens[0] = xr - xl
    lens[1] = yb - yt
    lens[2] = lens[0]
    lens[3] = lens[1]
    per = 2 * (lens[0] + lens[1])
    let d = dist - Math.floor(dist / per) * per
    let e = 0
    while (e < 3 && d > lens[e]) d -= lens[e++]
    const f = d / lens[e]
    out[0] =
      e === 0
        ? xl + f * lens[0]
        : e === 1
          ? xr
          : e === 2
            ? xr - f * lens[0]
            : xl
    out[1] =
      e === 0
        ? yt
        : e === 1
          ? yt + f * lens[1]
          : e === 2
            ? yb
            : yb - f * lens[1]
  }
  const cornerDist = (c: number) =>
    c === 0
      ? 0
      : c === 1
        ? lens[0]
        : c === 2
          ? lens[0] + lens[1]
          : per - lens[3]
  // direção "para dentro" (elíptica: perpendicular nas beiradas, diagonal
  // nos cantos) e tamanho conforme a beirada (menores no alto e embaixo)
  const inward = (x: number, y: number, out: number[]) => {
    const hx = view.A / 2
    const dx = (hx - x) / hx
    const dy = (0.5 - y) / 0.5
    const l = Math.hypot(dx, dy) || 1
    out[0] = dx / l
    out[1] = dy / l
    out[2] = 0.66 + 0.34 * smooth(0.35, 0.9, Math.abs(dx / l))
  }

  // estado da roleta (suavizado, como o createWheelEnergy do kit)
  let last = -1
  let phase: WheelPhase = 'idle'
  let spin = 0
  let flash = 0
  let after = 0
  let race = 0
  let home = 0
  let wonAt = -99
  const pos = [0, 0]
  const dir = [0, 0, 1]

  const frame = (t: number) => {
    const dt = last < 0 ? 0 : Math.min(Math.max(t - last, 0), 0.25)
    last = t
    const now = wheelPhase()
    if (now !== phase) {
      if (now === 'won') {
        flash = 1
        wonAt = t
        parseColor(
          document.documentElement.style.getPropertyValue('--win-color'),
          U.u_winCol as number[],
        )
      }
      phase = now
    }
    spin +=
      ((now === 'spinning' ? 1 : 0) - spin) *
      (1 - Math.exp(-dt * (now === 'spinning' ? 3 : 1.2)))
    flash *= Math.exp(-dt / 1.3)
    after += ((now === 'won' ? 1 : 0) - after) * (1 - Math.exp(-dt * 0.7))
    // na roleta girando as gotas correm pela moldura (posição integrada:
    // acelerar não dá saltos)
    race += dt * spin * 0.55
    // a Gotinha corre junto e, quando a roleta para, termina a volta com
    // calma até a casa dela (margem direita)
    if (spin > 0.05) home += dt * spin * 0.5
    else home = Math.min(Math.ceil(home / per - 1e-6) * per, home + dt * 0.09)

    // hora do dia
    const tau = fract(t / CYCLE + T0)
    let s = 1
    while (s < MOODS.length - 1 && MOODS[s][0] < tau) s++
    const [ta, ma] = MOODS[s - 1]
    const [tb, mb] = MOODS[s]
    const f = smooth(0, 1, (tau - ta) / Math.max(tb - ta, 1e-6))
    for (let k = 0; k < 4; k++) {
      const o = U[MOOD_KEYS[k]] as number[]
      const a = ma[k] as Rgb
      const b = mb[k] as Rgb
      for (let c = 0; c < 3; c++) o[c] = a[c] + (b[c] - a[c]) * f
    }
    U.u_night = ma[4] + (mb[4] - ma[4]) * f

    // virada do milênio (festa) e bug (falha) — instantes do ciclo
    const sv = (tau - V_AT) * CYCLE
    const party =
      sv >= 0 && sv < 9
        ? Math.exp(-sv * 0.38) * (0.65 + 0.35 * Math.cos(sv * 4.4))
        : 0
    const sb = (tau - BUG_AT) * CYCLE
    const glitch =
      sb >= 0 && sb < 2.6 ? smooth(0, 0.2, sb) * (1 - smooth(2.1, 2.6, sb)) : 0

    const fx = U.u_fx as number[]
    fx[0] = spin
    fx[1] = flash
    fx[2] = after
    fx[3] = glitch
    const k = U.u_k as number[]
    k[0] = (t * 0.45) % (Math.PI * 2)
    k[1] = fract(t * 0.045)
    k[2] = party
    k[3] = Math.floor(t * 3) % 97

    // gotas
    const Uu = view.U
    const age = t - wonAt
    track(0, pos) // atualiza comprimentos da pista
    for (let i = 0; i < DROPS.length; i++) {
      const g = DROPS[i]
      const b = balls[i]
      let r = g.r * Uu * (1 + 0.13 * Math.sin(t * g.w + g.p))
      if (g.k === 2) {
        // satélite: gira em torno da mãe, desgruda e volta
        const m = balls[g.at]
        inward(m[0], m[1], dir)
        const base = Math.atan2(dir[1], dir[0])
        const ang = base + 0.85 * Math.sin(t * g.w * 0.6 + g.p) + race * 7
        const out = 0.5 - 0.5 * Math.cos(t * g.w + g.p * 1.7)
        const dist = m[2] * (0.45 + 1.05 * out)
        b[0] = m[0] + Math.cos(ang) * dist
        b[1] = m[1] + Math.sin(ang) * dist
        r *= 0.85 + 0.25 * spin
      } else {
        // mascote: passeia devagar pela margem direita, perto do topo
        const dist =
          g.k === 0
            ? cornerDist(g.at) + 0.05 * Math.sin(t * g.w * 0.7 + g.p)
            : g.k === 3
              ? cornerDist(1) +
                lens[1] * (0.15 + 0.28 * (0.5 - 0.5 * Math.cos(t * 0.045))) +
                home
              : g.at * per + g.v * t + race * (0.85 + 0.3 * fract(g.p))
        track(dist, pos)
        inward(pos[0], pos[1], dir)
        // respira para dentro e para fora (mais no giro); a Gotinha dá
        // dois pulinhos para dentro de vez em quando
        const hb = t % 37
        const hop =
          g.k === 3 && hb < 1.3
            ? Math.abs(Math.sin((hb / 1.3) * Math.PI * 2))
            : 0
        const breathe =
          (g.k === 0 ? 0.25 : g.k === 3 ? 0.3 + 0.55 * hop : 0.15) +
          (g.k === 3 ? 0.08 : 0.2 + 0.25 * spin) *
            Math.sin(t * g.w * 0.8 + g.p * 2)
        r *= dir[2]
        b[0] = pos[0] + dir[0] * breathe * r
        b[1] = pos[1] + dir[1] * breathe * r
      }
      // vitória: duas ondas saindo da roleta incham as gotas
      if (age < 5) {
        const lx = b[0] - view.wx
        const ly = b[1] - 0.48
        const l = age - Math.sqrt(lx * lx + ly * ly) / 0.85
        r *=
          1 +
          0.38 * Math.exp(-l * l * 10) +
          0.22 * Math.exp(-(l - 1.2) * (l - 1.2) * 10)
      }
      // festa da virada: pulsam juntas
      r *= 1 + 0.12 * party * Math.sin(t * 4.4 - i * 0.6)
      // calma atrás do título
      const c = view.calm
      const ox = Math.max(c[0] - b[0], 0, b[0] - c[2])
      const oy = Math.max(c[1] - b[1], 0, b[1] - c[3])
      const gap = Math.sqrt(ox * ox + oy * oy)
      r *= 0.12 + 0.88 * smooth(0.3 * r, 1.5 * r, gap)
      b[2] = r
      // brilho ✦ (curto, de vez em quando; todos acendem na vitória)
      const tw = g.tw
        ? Math.pow(Math.max(Math.sin(t * g.tw + g.p * 3), 0), 28)
        : 0
      b[3] = g.tw ? Math.min(Math.max(tw, flash * 0.9, party * 0.7), 1) : 0
    }

    // olhos da Gotinha: piscadas (às vezes duplas), olhar na roleta ou
    // rodando com o giro, olhos arregalados no bug e sorriso na vitória
    const eye = U.u_eye as number[]
    const me = balls[6]
    const b1 = t % 4.7
    const b2 = t % 13.3
    let open = b1 < 0.16 ? Math.abs(b1 - 0.08) / 0.08 : 1
    if (b2 > 0.3 && b2 < 0.46) open = Math.min(open, Math.abs(b2 - 0.38) / 0.08)
    eye[0] = open * (1 + 0.4 * glitch)
    const lx = view.wx - me[0]
    const ly = 0.48 - me[1]
    const ll = Math.hypot(lx, ly) || 1
    const ga = race * 9
    eye[1] = (lx / ll) * 0.07 * (1 - spin) + Math.cos(ga) * 0.08 * spin
    eye[2] = (ly / ll) * 0.05 * (1 - spin) + Math.sin(ga) * 0.06 * spin
    eye[3] = Math.min(Math.max(after, party * 1.4), 1)
    return U
  }
  const dispose = () => window.removeEventListener('resize', measure)
  return { frame, dispose }
}
