// Mundo 3D do tema Retrowave num único fragment shader (GLSL ES 1.0),
// desenhado pelo ShaderCanvas do kit a meia resolução e 30 fps.
//
// Projeção: câmera a 1 unidade do chão, horizonte em HZ (fração da altura,
// a partir de baixo) e ponto de fuga no centro da tela. Um ponto do chão a
// uma distância dy abaixo do horizonte está na profundidade z = 1 / dy e na
// posição lateral X = x / (dy * A), com x em unidades da altura da tela e
// A = proporção / (16:9). As camadas em CSS (palmeiras, carro) usam a mesma
// conta em vw/vh: x = 50vw + 56.25vw * X * dy e y = (1 - HZ + dy) * 100vh.
//
// Céu: degradê por fase (pôr do sol, noite, alvorada neon), estrelas com
// cintilação, estrelas cadentes, lua crescente, sol listrado com bloom e
// flare, cordilheiras low-poly em wireframe (duas camadas com paralaxe),
// cidade no horizonte com janelas acendendo à noite, relâmpagos distantes.
// Chão: grade neon antisserrilhada pelo tamanho do pixel (vira média perto
// do horizonte, sem moiré), duas estradas com bordas ciano e faixa
// tracejada, faróis e lanternas do tráfego com reflexo no asfalto molhado,
// reflexo listrado do sol, névoa de profundidade e a onda da vitória.
// Postes de luz nas duas beiras (um a cada 4,8 unidades, cabeças rosa e
// ciano alternadas, poça de luz no asfalto) que acendem em cascata no
// crepúsculo e apagam no fim da alvorada: cada pixel acha o poste mais
// próximo invertendo a projeção (z = X * A / x), custo fixo.
//
// Tempos vindos do JS já reduzidos (u_t = segundos mod 240, u_scroll mod
// 9,6): toda frequência aqui fecha um número inteiro de voltas em 240 s
// (e a grade, a faixa e os postes fecham em 9,6), então não há salto
// quando o relógio volta a zero.

export const FRAG = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 u_res;
uniform float u_spin;
uniform float u_win;
uniform float u_t;
uniform float u_cyc;
uniform float u_scroll;
uniform vec2 u_drift;
uniform vec4 u_carL;
uniform vec2 u_carR;
uniform vec3 u_wcol;
uniform float u_after;
uniform vec3 u_bolt;

#define HZ 0.40
#define XR 2.15
#define RW 0.46
#define PI 3.14159265

float h11(float n) { return fract(sin(n * 91.345) * 47453.5453); }
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float tri(float x) { return abs(fract(x) - 0.5) * 2.0; }

float seg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * t);
}

// cordilheira low-poly: um pico por célula, vales sorteados.
// x = altura do cume, y = distância às arestas internas, z = ao contorno
vec3 range(vec2 q, float w, float s, float lo, float hi) {
  float k = floor(q.x / w);
  float f = q.x / w - k;
  float v0 = lo * h11(k + s);
  float v1 = lo * h11(k + 1.0 + s);
  float pk = 0.3 + 0.4 * h11(k * 1.7 + s * 3.0);
  float ph = mix(lo * 1.6, hi, h11(k * 3.1 + s * 7.0));
  float up = step(f, pk);
  float y = mix(mix(ph, v1, (f - pk) / (1.0 - pk)), mix(v0, ph, f / pk), up);
  float sl = mix((v1 - ph) / ((1.0 - pk) * w), (ph - v0) / (pk * w), up);
  vec2 P = vec2((k + pk) * w, ph);
  float d = seg(q, P, vec2((k + pk * 0.3) * w, 0.0));
  d = min(d, seg(q, P, vec2((k + pk + (1.0 - pk) * 0.5) * w, 0.0)));
  d = min(d, seg(q, vec2((k + pk * 0.55) * w, mix(v0, ph, 0.55)),
    vec2((k + pk * 0.85) * w, 0.0)));
  d = min(d, seg(q, vec2((k + pk + (1.0 - pk) * 0.4) * w, mix(ph, v1, 0.4)),
    vec2((k + 0.97) * w, 0.0)));
  return vec3(y, d, abs(q.y - y) / sqrt(1.0 + sl * sl));
}

// estrela cadente: corre por 0,8 s a cada P segundos (P divide 240)
float shoot(vec2 p, float P, float seed, float halfW, float px) {
  float k = floor(u_t / P);
  float lt = u_t - k * P;
  if (lt > 0.8) return 0.0;
  float r1 = h11(k * 7.13 + seed);
  float r2 = h11(k * 3.71 + seed * 2.0);
  float r3 = h11(k * 1.37 + seed * 5.0);
  vec2 a = vec2((r1 * 2.0 - 1.0) * halfW * 0.9, 0.80 + 0.17 * r2);
  vec2 dir = normalize(vec2(r3 > 0.5 ? 1.0 : -1.0, -0.42));
  float pr = lt / 0.8;
  vec2 head = a + dir * pr * 0.42;
  float len = 0.05 + 0.13 * sin(pr * PI);
  vec2 pa = p - head;
  float s = clamp(dot(pa, -dir) / len, 0.0, 1.0);
  float d = length(pa + dir * s * len) / px;
  float fade = sin(pr * PI);
  return ((1.0 - s) * exp(-d * 0.9) + exp(-length(pa) / px * 0.5) * 0.6) * fade;
}

// par de luzes de um carro em (X, z), a 0,12 do chão, com halo e o risco
// do reflexo no asfalto molhado
vec3 lamps(vec2 p, float X, float z, float A, vec3 lc, float sep, float px) {
  float dyc = 1.0 / z;
  vec2 b = vec2(X * dyc * A, HZ - dyc * 0.88);
  float r = max(0.016 * dyc, px * 0.7);
  vec2 q = p - b;
  q.x = abs(q.x) - sep * dyc * A;
  float d = length(q);
  float core = exp(-d * d / (r * r));
  float glow = exp(-d / (r * 4.0)) * 0.4;
  float refl = exp(-abs(q.x) / (r * 1.2)) * step(q.y, 0.0) *
    exp(q.y / (r * 10.0)) * 0.4;
  return lc * (core * 1.6 + glow + refl) * exp(-z * 0.025);
}

// carro visto de trás (silhueta escura) com lanternas
// postes de luz na beira de fora das estradas (lado s = -1 ou 1)
#define LP 4.8
#define LX 2.8
#define ARM 0.38
vec3 lampCol(float k) {
  return mod(k, 2.0) < 0.5 ? vec3(1.0, 0.36, 0.78) : vec3(0.36, 0.9, 1.0);
}
float lampOn(float k, float c) {
  float o = 0.035 * h11(mod(k, 64.0) + 3.0);
  return smoothstep(0.27 + o, 0.285 + o, c) * (1.0 - smoothstep(0.86 + o, 0.875 + o, c));
}
vec3 lampPost(vec3 col, vec2 p, float s, float A, float c, float px) {
  if (p.x * s <= 0.0) return col;
  // poste e braço: o poste cujo x na tela passa por este pixel
  float zc = LX * A / abs(p.x);
  float k = floor((zc + u_scroll) / LP + 0.5);
  float zk = k * LP - u_scroll;
  if (zk > 0.7) {
    float iz = 1.0 / zk;
    float xk = s * LX * A * iz;
    float top = HZ + 0.6 * iz;
    float w = max(0.022 * A * iz, px * 0.6);
    float pole = smoothstep(w + px, w, abs(p.x - xk)) * step(HZ - iz, p.y) * step(p.y, top);
    float ax = (xk - p.x) * s;
    float arm = smoothstep(0.014 * iz + px, 0.014 * iz, abs(p.y - top)) *
      step(-w, ax) * step(ax, ARM * A * iz);
    col = mix(col, vec3(0.07, 0.02, 0.12), max(pole, arm) * exp(-zk * 0.012));
  }
  // cabeça acesa e halo: procura pelo x da cabeça, com os vizinhos
  float xh = LX - ARM;
  float kh = floor((xh * A / abs(p.x) + u_scroll) / LP + 0.5);
  for (int j = -1; j <= 1; j++) {
    float kj = kh + float(j);
    float z2 = kj * LP - u_scroll;
    if (z2 < 0.7) continue;
    float iz = 1.0 / z2;
    vec2 q = (p - vec2(s * xh * A * iz, HZ + 0.585 * iz)) * z2;
    float d = length(q * vec2(1.0, 2.6));
    float on = lampOn(kj, c);
    if (on <= 0.0) continue;
    // cone de luz até o chão (a cabeça está a 1,58 do chão)
    float down = -q.y;
    float cone = exp(-abs(q.x) / (0.03 + 0.32 * max(down, 0.0))) *
      smoothstep(0.0, 0.08, down) * smoothstep(1.62, 1.1, down);
    col += lampCol(kj) * on * (exp(-d * d / 0.002) * 2.0 + exp(-d / 0.3) * 0.42 +
      cone * 0.13) * exp(-z2 * 0.022);
  }
  return col;
}

vec3 rearCar(vec3 col, vec2 p, float X, float z, float A, float px) {
  float dyc = 1.0 / z;
  vec2 c = vec2(X * dyc * A, HZ - dyc + 0.075 * dyc);
  vec2 hs = vec2(0.17 * dyc * A, 0.075 * dyc);
  vec2 q = abs(p - c) - hs;
  float box = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  float body = smoothstep(px, -px, box) * exp(-z * 0.02);
  col = mix(col, vec3(0.03, 0.0, 0.07), body * 0.92);
  // teto refletindo o céu
  col += vec3(1.0, 0.5, 0.8) * 0.45 * body * smoothstep(-hs.y * 0.5, hs.y, p.y - c.y) *
    exp(-z * 0.03);
  col += vec3(1.0, 0.1, 0.45) * exp(-max(box, 0.0) / (0.05 * dyc)) * 0.12 *
    smoothstep(c.y, c.y - hs.y * 3.0, p.y);
  return col + lamps(p, X, z, A, vec3(1.0, 0.16, 0.36), 0.12, px);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  float halfW = asp * 0.5;
  float px = 1.0 / u_res.y;
  vec2 p = vec2((uv.x - 0.5) * asp, uv.y);
  float A = max(asp / 1.7778, 0.6);

  // fases: pôr do sol (S), noite (N) e alvorada neon (D)
  float c = u_cyc;
  float wN = smoothstep(0.30, 0.42, c) * (1.0 - smoothstep(0.68, 0.78, c));
  float wD = smoothstep(0.68, 0.78, c) * (1.0 - smoothstep(0.86, 0.98, c));
  float wS = 1.0 - wN - wD;

  // sol: afunda no pôr do sol, volta na alvorada
  float elev = mix(mix(0.07, -0.21, smoothstep(0.0, 0.36, c)), 0.07,
    smoothstep(0.70, 0.90, c));
  float R = 0.165;
  vec2 sc = vec2(0.155 * asp, HZ + elev);
  float sunUp = smoothstep(-R, -R * 0.2, elev);
  vec3 sTop = mix(vec3(1.0, 0.95, 0.36), vec3(1.0, 1.0, 0.95), wD);
  vec3 sMid = mix(vec3(1.0, 0.6, 0.22), vec3(0.55, 0.95, 1.0), wD);
  vec3 sBot = mix(vec3(1.0, 0.16, 0.66), vec3(1.0, 0.4, 0.78), wD);
  vec3 sGlow = mix(vec3(1.0, 0.32, 0.5), vec3(0.6, 0.55, 1.0), wD);

  vec3 hzCol = vec3(1.0, 0.42, 0.36) * wS + vec3(0.75, 0.16, 0.62) * wN +
    vec3(1.0, 0.62, 0.86) * wD;
  vec3 lineCol = vec3(1.0, 0.18, 0.7) * wS + vec3(0.8, 0.2, 1.0) * wN +
    vec3(0.3, 0.92, 1.0) * wD;
  lineCol = mix(lineCol, u_wcol, u_after * 0.45);
  float boost = 1.0 + 0.6 * u_spin;

  float dS = length(p - sc);
  vec3 col;

  if (uv.y >= HZ) {
    // ---------------- céu ----------------
    float h = uv.y - HZ;
    vec3 s = mix(vec3(1.0, 0.56, 0.26), vec3(0.86, 0.12, 0.5), smoothstep(0.0, 0.1, h));
    s = mix(s, vec3(0.38, 0.07, 0.45), smoothstep(0.07, 0.3, h));
    s = mix(s, vec3(0.08, 0.02, 0.2), smoothstep(0.26, 0.6, h));
    vec3 n = mix(vec3(0.36, 0.08, 0.45), vec3(0.12, 0.04, 0.25), smoothstep(0.0, 0.16, h));
    n = mix(n, vec3(0.015, 0.01, 0.06), smoothstep(0.14, 0.6, h));
    vec3 d = mix(vec3(1.0, 0.8, 0.88), vec3(1.0, 0.42, 0.7), smoothstep(0.0, 0.07, h));
    d = mix(d, vec3(0.16, 0.46, 0.62), smoothstep(0.06, 0.27, h));
    d = mix(d, vec3(0.03, 0.08, 0.2), smoothstep(0.24, 0.6, h));
    col = s * wS + n * wN + d * wD;

    // estrelas: células com sorteio, cintilação que fecha em 240 s
    float starVis = (wN + 0.4 * wD + 0.12 * wS) * smoothstep(0.05, 0.3, h);
    if (starVis > 0.01) {
      vec2 g = p * 70.0;
      vec2 id = floor(g);
      float r = h21(id);
      if (r > 0.84) {
        vec2 o = vec2(h21(id + 3.7), h21(id + 9.1)) * 0.6 + 0.2;
        float sd = length(fract(g) - o) / (70.0 * px);
        float tw = 0.55 + 0.45 * sin(u_t * 0.2618 * floor(3.0 + r * 20.0) + r * 60.0);
        col += vec3(1.0, 0.9, 1.0) * smoothstep(1.4, 0.0, sd) * tw * (r - 0.84) * 6.0 * starVis;
      }
      vec2 g2 = p * 19.0;
      vec2 id2 = floor(g2);
      float r2 = h21(id2 + 17.0);
      if (r2 > 0.86) {
        vec2 o2 = vec2(h21(id2 + 1.3), h21(id2 + 5.9)) * 0.5 + 0.25;
        vec2 sq = abs(fract(g2) - o2) / (19.0 * px);
        float tw2 = 0.5 + 0.5 * sin(u_t * 0.5236 * floor(1.0 + r2 * 4.0) + r2 * 30.0);
        float cross = exp(-sq.x * 1.4) * exp(-sq.y * 0.25) + exp(-sq.y * 1.4) * exp(-sq.x * 0.25);
        float core = exp(-dot(sq, sq) * 0.5);
        vec3 tint = mix(vec3(1.0, 0.75, 0.95), vec3(0.7, 0.95, 1.0), h11(r2 * 13.0));
        col += tint * (core * 1.2 + cross * 0.5) * tw2 * starVis;
      }
      // estrelas cadentes (e uma chuva delas no meio da noite)
      float burst = smoothstep(0.5, 0.52, c) * (1.0 - smoothstep(0.56, 0.58, c));
      float sh = shoot(p, 8.0, 1.0, halfW, px) + shoot(p, 12.0, 7.0, halfW, px) +
        shoot(p, 2.0, 3.0, halfW, px) * burst + shoot(p, 3.0, 5.0, halfW, px) * burst;
      col += vec3(1.0, 0.85, 1.0) * sh * (wN + 0.3 * wD);
    }

    // lua crescente subindo pela margem esquerda durante a noite
    if (wN > 0.01) {
      vec2 mc = vec2((0.055 - 0.5) * asp, mix(HZ + 0.03, 0.8, smoothstep(0.32, 0.74, c)));
      float md = length(p - mc);
      float disc = smoothstep(0.042 + px, 0.042 - px, md);
      float bite = smoothstep(0.04 - px, 0.04 + px, length(p - mc - vec2(0.017, 0.012)));
      col += vec3(0.5, 0.75, 1.0) * exp(-md / 0.05) * 0.22 * wN;
      col = mix(col, vec3(0.92, 0.97, 1.0), disc * bite * wN);
    }

    // sol listrado: listras correm para baixo e afinam perto do chão
    float disc = smoothstep(R + px * 1.5, R - px * 1.5, dS);
    if (disc > 0.0) {
      float v = (p.y - sc.y) / R;
      float g = v * 0.5 + 0.5;
      vec3 sun = g > 0.5 ? mix(sMid, sTop, (g - 0.5) * 2.0) : mix(sBot, sMid, g * 2.0);
      float sv = 0.18 - v;
      float stripe = 1.0;
      if (sv > 0.0) {
        float k = sv * 6.5 - u_t * 0.35;
        float gap = 0.1 + 0.62 * smoothstep(0.0, 1.18, sv);
        float fk = fract(k);
        float aa = 6.5 * px / R * 1.2;
        stripe = smoothstep(gap - aa, gap + aa, fk) * smoothstep(1.0, 1.0 - aa, fk);
      }
      col = mix(col, sun, disc * stripe);
    }

    // relâmpago distante (no fundo, atrás das montanhas)
    if (u_bolt.y > 0.001) {
      float b0 = (u_bolt.x - 0.5) * asp;
      float by = h - 0.33;
      float bx = b0 + 0.03 * (tri(h * 9.0 + u_bolt.z) - 0.5) +
        0.012 * (tri(h * 31.0 + u_bolt.z * 2.0) - 0.5);
      float bd = abs(p.x - bx) / px;
      col += vec3(0.8, 0.92, 1.0) * (exp(-bd * 0.9) + exp(-bd * 0.12) * 0.2) *
        u_bolt.y * step(by, 0.0);
      col += vec3(0.55, 0.4, 1.0) * exp(-length(vec2(p.x - b0, h - 0.14)) * 6.0) *
        u_bolt.y * 0.55;
    }

    // cordilheira do fundo (rosa) e da frente (ciano), com paralaxe
    if (h < 0.17) {
    vec3 mf = range(vec2(p.x + u_drift.x, h), 0.13, 11.0, 0.035, 0.13);
    vec3 fogM = mix(hzCol, col, 0.35);
    if (h < mf.x) {
      vec3 fill = mix(vec3(0.17, 0.05, 0.3) * (0.5 + 0.5 * wS + 0.3 * wD), fogM, 0.25 + 0.4 * smoothstep(0.1, 0.0, h));
      col = fill + lineCol * 0.55 * exp(-mf.y / (px * 1.1)) * (0.6 + 0.4 * wN);
      col += vec3(0.6, 0.75, 1.0) * u_bolt.y * 0.35;
    }
    col += lineCol * 0.6 * exp(-mf.z / (px * 1.2)) * smoothstep(0.0, 0.01, mf.x - 0.002);

    // cidade no horizonte, à esquerda, deslizando com a curva da estrada
    float cx = p.x + u_drift.y * 0.6;
    float cu = cx / asp + 0.5;
    float env = smoothstep(0.36, 0.18, cu) * smoothstep(-0.04, 0.03, cu);
    if (env > 0.0 && h < 0.16) {
      float bx = cx / 0.017;
      float id = floor(bx);
      float fx = bx - id;
      float bh = (0.012 + 0.11 * pow(h11(id * 1.3 + 5.0), 2.2)) * env;
      float tower = step(0.985, h11(id * 0.71 + 2.0));
      bh += tower * 0.05 * env;
      float wall = step(0.08, fx) * step(fx, 0.92);
      if (h < bh && wall > 0.0) {
        vec3 bc = mix(vec3(0.05, 0.01, 0.1), hzCol * 0.18, 0.4 * wS + 0.3 * wD);
        col = mix(bc, fogM, 0.2 * smoothstep(0.03, 0.0, h));
        vec2 wc = vec2(floor(fx * 3.0), floor(h / 0.0062));
        vec2 wf = vec2(fract(fx * 3.0), fract(h / 0.0062));
        float win = step(0.3, wf.x) * step(wf.x, 0.75) * step(0.3, wf.y) * step(wf.y, 0.75);
        float hw = h21(wc + id * 13.0);
        float lit = step(0.62 - 0.36 * (wN + 0.4 * wS), hw);
        vec3 wcol = hw > 0.9 ? vec3(0.3, 0.95, 1.0) : (hw > 0.8 ? vec3(1.0, 0.35, 0.8) : vec3(1.0, 0.82, 0.45));
        col += wcol * win * lit * (0.35 + 0.65 * wN);
      }
      // farol da antena piscando (0,5 Hz)
      vec2 bp = vec2((id + 0.5) * 0.017 - u_drift.y * 0.6, bh + 0.004);
      col += vec3(1.0, 0.15, 0.2) * tower * exp(-length(p - vec2(bp.x, HZ + bp.y)) / px * 0.5) *
        step(0.5, fract(u_t * 0.5)) * 1.5;
    }

    vec3 mn = range(vec2(p.x + u_drift.y, h), 0.085, 23.0, 0.012, 0.06);
    float nearMask = smoothstep(-0.2 * asp, -0.12 * asp, p.x + u_drift.y * 0.6);
    if (h < mn.x && nearMask > 0.0) {
      vec3 fill = vec3(0.035, 0.01, 0.08) + hzCol * 0.05;
      vec3 mcol = fill + vec3(0.18, 0.85, 1.0) * 0.42 * exp(-mn.y / (px * 0.8));
      mcol += vec3(0.6, 0.8, 1.0) * u_bolt.y * 0.25;
      col = mix(col, mcol, nearMask);
    }
    col += vec3(0.2, 0.85, 1.0) * 0.8 * exp(-mn.z / (px * 1.1)) * nearMask *
      smoothstep(0.0, 0.006, mn.x - 0.001);
    }

    // neblina rente ao horizonte
    col += hzCol * exp(-h / 0.025) * 0.35;

    // postes (a parte de cima passa do horizonte)
    if (h < 0.3) {
      col = lampPost(col, p, 1.0, A, c, px);
      col = lampPost(col, p, -1.0, A, c, px);
    }

    // bloom do sol (na frente das montanhas)
    float bloom = exp(-max(dS - R, 0.0) * 13.0) * 0.5 + exp(-dS * 2.6) * 0.3;
    col += sGlow * bloom * sunUp * (0.8 + 0.5 * u_spin);
    float flare = exp(-abs(p.y - sc.y) / (0.002 + 0.005 * u_spin)) *
      exp(-abs(p.x - sc.x) * (1.6 - 0.8 * u_spin));
    col += mix(vec3(0.5, 0.9, 1.0), vec3(1.0), 0.4) * flare * sunUp * (0.18 + 0.9 * u_spin);

    // anéis da vitória: nascem no horizonte e se abrem pelo céu
    float pr = 1.0 - u_win;
    float amp = u_win * smoothstep(0.0, 0.04, pr);
    if (amp > 0.002) {
      float rq = length(vec2(p.x, h * 1.3));
      float dr = abs(rq - pr * 1.15);
      float dr2 = abs(rq - max(pr - 0.12, 0.0) * 1.15);
      col += u_wcol * (exp(-dr / (px * (3.0 + 18.0 * pr))) * 1.5 +
        exp(-dr2 / (px * (2.0 + 10.0 * pr))) * 0.8 + exp(-dr * 7.0) * 0.3) * amp;
    }
  } else {
    // ---------------- chão ----------------
    float dy = HZ - uv.y;
    float z = 1.0 / dy;
    float X = p.x / (dy * A);
    float fX = px / dy * sqrt(1.0 / (A * A) + X * X);
    float fZ = px / (dy * dy);
    float fog = exp(-z * 0.045);

    vec3 base = mix(vec3(0.05, 0.008, 0.1), vec3(0.12, 0.03, 0.2), wD * 0.6);
    col = mix(hzCol * 0.55, base, 1.0 - exp(-z * 0.07));

    // grade neon (calma atrás do cartão da roleta)
    float cell = 0.32;
    float gxd = abs(fract(X / cell + 0.5) - 0.5) * cell / fX;
    float gzd = abs(fract((z + u_scroll) / cell + 0.5) - 0.5) * cell / fZ;
    float lx = clamp(max(0.011 / fX, 0.5) + 0.5 - gxd, 0.0, 1.0);
    float lz = clamp(max(0.011 / fZ, 0.5) + 0.5 - gzd, 0.0, 1.0);
    float fadeX = smoothstep(2.0, 6.0, cell / fX);
    float fadeZ = smoothstep(2.0, 6.0, cell / fZ);
    float rd = abs(abs(X) - XR);
    float off = smoothstep(RW - fX, RW + fX * 2.0, rd);
    float calm = 1.0 - 0.35 * smoothstep(0.24, 0.1, abs(uv.x - 0.42)) * smoothstep(0.0, 0.08, uv.y);
    float grid = max(lx * fadeX, lz * fadeZ) * 0.9 +
      (exp(-gxd * 0.3) * fadeX + exp(-gzd * 0.3) * fadeZ) * 0.22 +
      (2.0 - fadeX - fadeZ) * 0.1;
    col += lineCol * grid * off * calm * boost * mix(0.35, 1.0, min(fog + 0.3, 1.0));

    // estradas: asfalto, faixa tracejada e bordas neon
    if (rd < RW) {
      col = mix(col, vec3(0.025, 0.006, 0.05) + hzCol * 0.2 * (1.0 - smoothstep(0.0, 0.08, dy)), 0.88);
      float dash = step(fract((z + u_scroll) / 1.6), 0.42) * smoothstep(3.0, 8.0, 1.6 / fZ);
      float dd = rd / fX;
      col += vec3(1.0, 0.82, 0.42) * clamp(max(0.012 / fX, 0.5) + 0.5 - dd, 0.0, 1.0) * dash * 0.9;
    }
    float ed = abs(rd - RW) / fX;
    col += vec3(0.18, 0.85, 1.0) * (clamp(max(0.014 / fX, 0.5) + 0.5 - ed, 0.0, 1.0) +
      exp(-ed * 0.25) * 0.3) * mix(0.4, 1.0, min(fog + 0.2, 1.0));

    // reflexo listrado do sol no chão molhado
    float rx = abs(p.x - sc.x);
    float band = 0.5 + 0.5 * sin(z * 7.0 - u_t * 1.5708);
    col += mix(sBot, sMid, 0.5) * exp(-rx / (0.035 + 0.45 * dy)) * exp(-dy * 3.5) *
      sunUp * (0.25 + 0.75 * band) * 0.6;

    // poças de luz dos postes no asfalto
    float kp = floor((z + u_scroll) / LP + 0.5);
    float onp = lampOn(kp, c);
    if (onp > 0.0) {
      vec2 dq = vec2((abs(X) - (LX - ARM)) / 0.72, (z - (kp * LP - u_scroll)) / 1.5);
      col += lampCol(kp) * onp * exp(-dot(dq, dq)) * 0.5;
    }
    col = lampPost(col, p, 1.0, A, c, px);
    col = lampPost(col, p, -1.0, A, c, px);

    // tráfego: carros nos ultrapassando à direita, contramão à esquerda
    if (abs(X) > 1.0) {
      col = rearCar(col, p, XR - 0.23, u_carR.x, A, px);
      col = rearCar(col, p, XR - 0.23, u_carR.y, A, px);
      vec3 head = vec3(0.85, 0.95, 1.0);
      col += lamps(p, -XR - 0.23, u_carL.x, A, head, 0.11, px);
      col += lamps(p, -XR + 0.23, u_carL.y, A, head, 0.11, px);
      col += lamps(p, -XR - 0.23, u_carL.z, A, head, 0.11, px);
      col += lamps(p, -XR + 0.23, u_carL.w, A, head, 0.11, px);
    }

    // onda da vitória: frente de luz vindo do horizonte pelo chão
    float pr = 1.0 - u_win;
    float amp = u_win * smoothstep(0.0, 0.05, pr);
    if (amp > 0.002) {
      float zw = 1.5 + 60.0 * (1.0 - pr) * (1.0 - pr);
      float wd = abs(z - zw) / (fZ * 2.0 + 0.04 * zw);
      col += u_wcol * (exp(-wd * 0.5) * 0.9 + grid * 0.8 * step(zw, z) * exp(-(z - zw) * 0.15)) * amp;
    }
    // névoa de profundidade: o chão some na cor do horizonte
    col = mix(hzCol * 0.7, col, 0.25 + 0.75 * (1.0 - exp(-dy * 22.0)));
  }

  // linha do horizonte em neon (e o clarão suave da vitória)
  float hd = abs(uv.y - HZ) / px;
  vec3 hl = mix(vec3(1.0, 0.45, 0.8), u_wcol, u_after * 0.6);
  col += hl * (exp(-hd * 0.8) * 0.9 + exp(-hd * 0.07) * 0.18) * boost;
  col += u_wcol * u_win * u_win * 0.45 * exp(-abs(uv.y - HZ) / 0.07);

  // vinheta leve e pontilhado contra degraus no degradê
  vec2 vq = (uv - 0.5) * vec2(1.0, 0.9);
  col *= 1.0 - 0.35 * dot(vq, vq);
  col += (h21(gl_FragCoord.xy) - 0.5) / 128.0;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
