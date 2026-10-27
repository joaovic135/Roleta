// Shader do tema Darksynth (GLSL ES 1.0, roda no ShaderCanvas do _kit, que
// o converte para GLSL ES 3.00 quando há WebGL2).
//
// Um quadro só, em camadas, de trás para a frente:
//   céu: degradê preto -> carmim, lua de sangue enorme atrás da pirâmide,
//        nuvens de tempestade (fbm) acesas por dentro pelos relâmpagos e
//        raios serrilhados descendo até as montanhas nas laterais;
//   pirâmide colossal ("O Vigia"): faces negras, juntas dos degraus com um
//        pulso de energia subindo até o olho, janelas minúsculas (algumas
//        piscam) que dão a escala, contorno aceso pela lua, base afogada na
//        névoa vermelha;
//   relevo: até 48 fatias (curvas de nível) de um campo de altura serrilhado
//        (ruído "ridged"), da frente para o fundo; a primeira crista acima do
//        pixel o cobre. Linhas vermelhas incandescentes + malha nas encostas,
//        névoa por profundidade. O vale é plano no meio (atrás da roleta) e
//        sobe em paredões nas bordas da tela;
//   por cima: halo das cristas, névoa rasteira, feixes da varredura, luz do
//        olho (fachos), brasas subindo, granulação de VHS e vinheta.
// Eventos: relâmpagos sorteados em janelas de 2,7 s (no máx. 2 clarões por
// janela), varredura do olho a cada 47 s, pulso nas juntas a cada 64 fatias
// voadas. Girando (u_spin): voo mais rápido (u_travel vem do JS), linhas e
// névoa mais fortes, mais relâmpagos, câmera tremendo. Vitória (u_win): um
// raio cai na ponta da pirâmide e rasteja pela base das nuvens (dois
// clarões) e o vale inteiro acende; depois tudo volta à calma.
//
// Coordenadas: uv.y = 0 embaixo, 1 no alto; uv.x centrado, em alturas de tela.
// PX = px CSS por px do canvas (u_css = 1 / scale, vem do ShaderCanvas: 2
// com o scale 0,5 do Scene.tsx), para o olho daqui cair exatamente sobre o
// olho em CSS (top: clamp(32px, 5.6vh, 64px); x no centro, ou a 72% da
// largura abaixo de 641px). O canvas tem 16px a mais de largura (8 de cada
// lado, para a tremida da fita).
// u_travel = fatias voadas, já em módulo 256 (o relevo repete a cada 256
// fatias, sem emenda: os períodos do ruído em z dividem 256).
//
// Custo: o laço do relevo é o grosso. Cada fatia só calcula o ruído se o
// pixel pode estar abaixo da crista dela (teto pela altura máxima) e, a
// cada oitava calculada, testa um teto mais justo antes da seguinte.
// Pixels do céu pulam direto as fatias do meio do vale (sem paredão) e
// param nas do fundo que já não alcançam (contas no laço). Nuvens, mares da
// lua, névoa rasteira e fachos do olho só calculam ruído onde aparecem.

export const FRAG = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_res;
uniform float u_spin;
uniform float u_win;
uniform float u_travel;
uniform float u_css;

#define PX u_css
#define HZ 0.40
#define CAM 1.0
#define Z0 0.35
#define DZ 0.5
#define ROWS 48
#define APEX 1.12
#define SLOPE 0.6
#define RM 0.30
#define MOONY 0.70

const vec3 RED = vec3(1.0, 0.085, 0.04);
const vec3 HOT = vec3(1.0, 0.84, 0.8);
const vec3 FOG = vec3(0.15, 0.012, 0.009);

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
// ruído 1D linear: zigue-zague (raios)
float zig(float x) {
  float i = floor(x);
  return mix(hash11(i), hash11(i + 1.0), fract(x));
}
// ruído de valor 2D; em y repete a cada "per" células
float vnoise(vec2 p, float per) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float y0 = mod(i.y, per);
  float y1 = mod(i.y + 1.0, per);
  float a = hash21(vec2(i.x, y0));
  float b = hash21(vec2(i.x + 1.0, y0));
  float c = hash21(vec2(i.x, y1));
  float d = hash21(vec2(i.x + 1.0, y1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// igual, mas linear em x: cristas em facetas retas (serrilhado)
float vlin(vec2 p, float per) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float uy = f.y * f.y * (3.0 - 2.0 * f.y);
  float y0 = mod(i.y, per);
  float y1 = mod(i.y + 1.0, per);
  float a = hash21(vec2(i.x, y0));
  float b = hash21(vec2(i.x + 1.0, y0));
  float c = hash21(vec2(i.x, y1));
  float d = hash21(vec2(i.x + 1.0, y1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), uy);
}
float fbm(vec2 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p, 8192.0);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return s;
}
// paredões: zero no meio do vale (rota da câmera), sobem para as bordas
float wallOf(float ax) {
  return smoothstep(1.3, 5.0, ax);
}
// altura do relevo (no laço, em linha): fatia k = z do ruído com períodos
// 32/64/128; h = n1² + 0,6 n2² + 0,3 n3² vezes o paredão, mais 0,14 n3
// distância (px do canvas) de p ao segmento a-b
float segD(vec2 p, vec2 a, vec2 b, float s) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) * s;
}

void main() {
  vec2 R = u_res * PX;
  float H = R.y;
  float asp = R.x / H;
  float pxs = u_res.y;
  vec2 uv = vec2(gl_FragCoord.x * PX / H - asp * 0.5, gl_FragCoord.y * PX / H);
  // relógio em laço de 3553,2 s (= 47 × 2,7 × 28): mantém a precisão em
  // sessões longas sem tirar a varredura de fase com o HUD em CSS
  float t = mod(u_time, 3553.2);
  float spin = u_spin;
  // girando, a câmera treme de leve
  vec2 q = vec2(uv.x, uv.y - HZ + spin * 0.004 * sin(t * 41.0));
  // no celular o título ocupa a esquerda do topo: o Vigia vai para 72% da
  // largura (o CSS faz o mesmo abaixo de 641px; o canvas tem 16px a mais)
  float ox = R.x < 657.0 ? 0.22 * (R.x - 16.0) / H : 0.0;
  vec2 E = vec2(ox, 1.0 - clamp(0.056 * H, 32.0, 64.0) / H);

  // ---- relâmpagos: janelas de 2,7 s, sorteio de chance, lado e altura
  float slot = floor(t / 2.7);
  float ts = t - slot * 2.7;
  float sh = mod(slot, 997.0);
  float hs = hash11(sh + 0.13);
  float on = step(hs, 0.34 + 0.24 * spin);
  float flash = on * (exp(-ts * 7.0) +
    step(hs, 0.16) * step(0.34, ts) * 0.7 * exp(-(ts - 0.34) * 9.0));
  float side = hash11(sh * 1.37 + 3.1) < 0.5 ? -1.0 : 1.0;
  vec2 F = vec2(
    side * (asp * 0.5 - 0.035 - 0.115 * hash11(sh * 2.11 + 1.3)),
    0.84 + 0.12 * hash11(sh * 3.7 + 0.7));
  float hasBolt = on * step(hash11(sh * 5.3 + 2.2), 0.62);

  // ---- vitória: tempo desde a parada (u_win cai como exp(-t / 1,3))
  float tw = -1.3 * log(max(u_win, 0.0001));
  float wEnv = exp(-tw * 2.2) + 0.8 * step(0.42, tw) * exp(-(tw - 0.42) * 2.6);

  // ---- varredura do olho a cada 47 s: faixa de luz vem do fundo
  float sp = mod(t, 47.0);
  float scanOn = smoothstep(0.0, 0.5, sp) * smoothstep(4.8, 3.8, sp);
  float scanZ = mix(Z0 + 24.0, Z0 + 0.8, clamp(sp / 4.4, 0.0, 1.0));

  // linhas mais fracas no meio (atrás dos cards), fortes nas bordas
  float gain = (1.0 + 0.8 * spin + 2.4 * wEnv) *
    mix(0.42, 1.0, smoothstep(0.3, 0.75, abs(uv.x)));
  float camX = 0.45 * sin(t * 0.13) + 0.25 * sin(t * 0.071 + 1.0);

  // ---- relevo
  float kb = floor(u_travel);
  float fr = u_travel - kb;
  float margin = 12.0 / pxs;
  vec3 terr = vec3(0.0);
  float cover = 0.0;
  float occZ = 1000.0;
  float halo = 0.0;
  // Pixel do céu: enquanto |X| < 1,3 não há paredão e a crista fica abaixo
  // do horizonte, então as fatias com z < zIn pulam todas. E, como a crista
  // nunca passa de 0,494|q.x| + (1,8 + 0,494|camX|) / z, as de z > zOut
  // também (dali para o fundo o pixel fica sempre acima): o laço para.
  float i0 = 0.0;
  float zOut = 1e6;
  if (q.y > margin) {
    float zIn = (1.3 - sign(q.x) * camX) / max(abs(q.x), 1e-4);
    i0 = floor((zIn - Z0) / DZ - 1.0 + fr);
    float room = q.y - margin - 0.494 * abs(q.x);
    if (room > 0.0) zOut = (1.8 + 0.494 * abs(camX)) / room;
  }
#if __VERSION__ >= 300
  for (int i = int(clamp(i0, 0.0, float(ROWS))); i < ROWS; i++) {
    float fi = float(i);
#else
  for (int i = 0; i < ROWS; i++) {
    float fi = float(i);
    if (fi < i0) continue;
#endif
    float pos = fi + 1.0 - fr;
    float z = Z0 + pos * DZ;
    if (z > zOut) break;
    float X = q.x * z + camX;
    float ax = abs(X);
    // teto possível desta fatia: se o pixel está acima, nem calcula o ruído
    float wall = wallOf(ax) * (1.4 + ax * 0.26);
    float yc = q.y * z + CAM - 0.14 - margin * z;
    if (yc > 1.9 * wall) continue;
    // tetos mais justos a cada oitava (n2 e n3 somam no máximo 0,6 e 0,3)
    float k = kb + 1.0 + fi;
    vec2 tp = vec2(X * 0.42, k * 0.125);
    float n1 = 1.0 - abs(vlin(tp, 32.0) * 2.0 - 1.0);
    if (yc > (n1 * n1 + 0.9) * wall) continue;
    float n2 = 1.0 - abs(vlin(tp * 2.0 + vec2(5.2, 0.0), 64.0) * 2.0 - 1.0);
    if (yc > (n1 * n1 + n2 * n2 * 0.6 + 0.3) * wall) continue;
    float n3 = 1.0 - abs(vlin(tp * 4.0 + vec2(1.7, 0.0), 128.0) * 2.0 - 1.0);
    float th = (n1 * n1 + n2 * n2 * 0.6 + n3 * n3 * 0.3) * wall + n3 * 0.14;
    float yr = (th - CAM) / z;
    float d = (q.y - yr) * pxs;
    // (1 - névoa)^1,5 = exp(-0,15 z): uma exponencial em vez de exp + pow
    float fog = 1.0 - exp(-z * 0.1);
    float fade = smoothstep(0.0, 0.7, pos) * smoothstep(48.0, 41.0, pos);
    float lit = exp(-z * 0.15) * gain;
    if (scanOn > 0.0) lit += 1.3 * scanOn * exp(-abs(z - scanZ) * 1.4);
    lit *= fade;
    if (d < 0.0) {
      float dd = -d;
      float gx = abs(fract(X * 0.7 + 0.5) - 0.5) / 0.7 / z * pxs;
      float mesh = exp(-gx * gx * 0.7) * wallOf(ax) * 0.5 *
        smoothstep(0.0, 3.0, dd);
      // no chão do vale (atrás da roleta) as curvas quase somem
      float floorK = mix(0.16, 1.0, smoothstep(0.0, 0.45, wallOf(ax)));
      float line = (exp(-dd * dd * 0.5) * 1.7 + exp(-dd * 0.16) * 0.14) *
        floorK + mesh;
      vec3 face = mix(vec3(0.004, 0.0, 0.001), FOG, fog * 0.85);
      face += vec3(0.6, 0.08, 0.06) * flash * 0.08 * (1.0 - fog) *
        exp(-abs(q.x - F.x) * 1.5);
      terr = face + RED * line * lit;
      cover = smoothstep(47.5, 43.0, pos);
      occZ = z;
      break;
    }
    halo += exp(-d * 0.45) * lit;
  }

  vec3 col = terr;
  if (cover < 1.0) {
    float sy = q.y;
    vec3 sky = mix(vec3(0.085, 0.007, 0.007), vec3(0.005, 0.0, 0.002),
      smoothstep(-0.02, 0.36, sy));
    sky += vec3(0.85, 0.1, 0.05) * exp(-abs(sy) * 24.0) * 0.38;

    // lua de sangue (atrás da pirâmide: só os "chifres" aparecem no alto)
    vec2 mc = uv - vec2(E.x, MOONY);
    float md = length(mc);
    float mdisk = smoothstep(RM + 1.5 / pxs, RM - 1.5 / pxs, md);
    if (mdisk > 0.0) {
      float mar = vnoise(mc * 8.0 + 3.0, 8192.0) * 0.6 +
        vnoise(mc * 21.0 + 7.0, 8192.0) * 0.4;
      vec3 moon = mix(vec3(0.5, 0.045, 0.028), vec3(0.13, 0.007, 0.006),
        smoothstep(0.38, 0.62, mar));
      moon *= (0.45 + 0.55 * smoothstep(RM * 1.02, RM * 0.15, md)) *
        (0.75 + 0.35 * clamp(mc.y / RM, -1.0, 1.0));
      moon += vec3(1.0, 0.28, 0.14) * smoothstep(RM * 0.93, RM, md) * 0.4;
      sky = mix(sky, moon, mdisk);
    }
    sky += vec3(0.75, 0.06, 0.03) * exp(-max(md - RM, 0.0) * 10.0) * 0.2 *
      (1.0 - mdisk);

    // pirâmide colossal: a ponta some acima da tela
    float w = (APEX - uv.y) * SLOPE;
    float inP = clamp((w - abs(uv.x - E.x)) * pxs + 0.5, 0.0, 1.0) *
      step(HZ - 0.1, uv.y);
    if (inP > 0.0) {
      float ex = E.x + 0.2 * w;
      float lf = smoothstep(1.0, -1.0, (uv.x - ex) * pxs);
      vec3 pyr = mix(vec3(0.020, 0.004, 0.005), vec3(0.006, 0.0, 0.001), lf);
      // juntas dos degraus; o pulso sobe da névoa até o olho
      float tier = (APEX - uv.y) / 0.042;
      float sd = (0.5 - abs(fract(tier) - 0.5)) * 0.042 * pxs;
      float pp = fract(u_travel / 64.0);
      float py = mix(HZ - 0.05, E.y, pp);
      float pulse = exp(-abs(uv.y - py) * 26.0) * smoothstep(1.0, 0.8, pp);
      pyr += RED * exp(-sd * sd * 0.6) * (0.015 + 0.55 * pulse) *
        smoothstep(HZ + 0.03, HZ + 0.12, uv.y);
      // janelas: uma luz por célula sorteada em cada degrau; algumas piscam
      float ti = floor(tier);
      float cw = 0.0105;
      float cx = floor(uv.x / cw);
      float hl = hash21(vec2(cx, ti));
      if (hl < 0.16) {
        vec2 lp = vec2((fract(uv.x / cw) - 0.5) * cw,
          (fract(tier) - 0.5) * 0.042) * pxs;
        float blink = step(0.25, fract(t * (0.05 + hl) + hl * 7.0));
        float far = smoothstep(HZ + 0.08, HZ + 0.3, uv.y);
        pyr += vec3(1.0, 0.12, 0.05) * exp(-dot(lp, lp) * 1.4) *
          (0.25 + 0.75 * blink) * far * (0.6 + 0.8 * pulse);
      }
      // contorno contra a lua e aresta da frente
      float edge = (w - abs(uv.x - E.x)) * pxs;
      float back = smoothstep(RM + 0.08, RM - 0.04, md);
      pyr += RED * exp(-edge * 0.7) * (0.03 + 0.5 * back +
        2.0 * flash * exp(-abs(uv.x - F.x) * 1.2));
      pyr += RED * exp(-abs(uv.x - ex) * pxs * 0.9) * (0.02 + 0.4 * pulse);
      // luz do olho escorrendo pela face
      pyr += vec3(1.0, 0.14, 0.05) * (0.12 + 0.3 * spin) *
        exp(-length((uv - E) * vec2(0.6, 1.0)) * 11.0);
      pyr = mix(pyr, FOG * 1.3, smoothstep(HZ + 0.3, HZ - 0.03, uv.y) * 0.9);
      sky = mix(sky, pyr, inP);
    }

    // nuvens de tempestade (o calor do olho abre um buraco nelas)
    float fl = flash * exp(-length((uv - F) * vec2(1.0, 1.5)) * 3.0);
    float deck = smoothstep(0.24, 0.5, sy);
    if (deck > 0.0) {
      deck *= smoothstep(0.035, 0.17, length((uv - E) * vec2(0.55, 1.0)));
      vec2 cp = vec2(uv.x * 1.4 + t * 0.016, uv.y * 3.1 - t * 0.005);
      float n = fbm(cp);
      float cl = smoothstep(0.46, 0.72, n) * deck;
      cl *= mix(1.0, 0.35 + 0.65 * smoothstep(0.86, 1.0, uv.y), inP);
      vec3 cc = mix(vec3(0.03, 0.004, 0.006), vec3(0.006, 0.001, 0.002),
        smoothstep(0.55, 0.9, n));
      cc += vec3(1.0, 0.3, 0.24) * fl * (0.3 + 1.2 * n);
      sky = mix(sky, cc, cl);
      // contorno das nuvens aceso pelo vermelho de baixo (e pelo relâmpago)
      float rim = (smoothstep(0.41, 0.46, n) - smoothstep(0.46, 0.55, n)) *
        deck * (1.0 - 0.7 * inP);
      sky += rim * (vec3(0.42, 0.04, 0.026) *
        (0.3 + 0.7 * smoothstep(0.75, 0.32, sy)) + vec3(1.0, 0.32, 0.25) * fl * 1.6);
    }
    sky += vec3(0.7, 0.12, 0.1) * fl * 0.12;

    col = mix(sky, terr, cover);
  }

  // raio serrilhado com um galho, do alto da tela até o vale: cai na frente
  // das montanhas do fundo (só fatias mais perto que 5 o tapam)
  if (hasBolt > 0.5 && flash > 0.02 && occZ > 5.0) {
    float y0 = 1.02;
    float y1 = HZ - 0.05;
    float k = clamp((y0 - uv.y) / (y0 - y1), 0.0, 1.0);
    float bx = F.x + (zig(uv.y * 24.0 + sh * 7.0) - 0.5) * 0.045 * (0.4 + k) +
      (zig(uv.y * 75.0 + sh) - 0.5) * 0.01;
    float bd = abs(uv.x - bx) * pxs;
    float iny = step(y1, uv.y) * step(uv.y, y0);
    float yb = mix(y0, y1, 0.25 + 0.2 * hash11(sh + 9.0));
    float kb2 = (y0 - yb) / (y0 - y1);
    float dir = hash11(sh * 0.7 + 4.0) < 0.5 ? -1.0 : 1.0;
    float bxb = F.x + (zig(yb * 24.0 + sh * 7.0) - 0.5) * 0.045 * (0.4 + kb2) +
      dir * (yb - uv.y) * 0.5 + (zig(uv.y * 60.0 + sh * 3.0) - 0.5) * 0.012;
    float bdb = abs(uv.x - bxb) * pxs;
    float inb = step(yb - 0.16, uv.y) * step(uv.y, yb) *
      smoothstep(yb - 0.16, yb - 0.04, uv.y);
    float b = exp(-bd * bd * 0.18) * iny + exp(-bdb * bdb * 0.4) * inb * 0.7;
    float g = exp(-bd * 0.15) * iny + exp(-bdb * 0.25) * inb * 0.5;
    col += (HOT * b * 1.2 + RED * g * 0.7) * flash * 1.4;
  }

  // halo das cristas e névoa rasteira
  col += RED * halo * 0.07;
  float mist = smoothstep(HZ + 0.12, HZ - 0.25, uv.y);
  if (mist > 0.0) {
    float fb = vnoise(vec2(uv.x * 2.2 + t * 0.03, uv.y * 7.0 - t * 0.012), 8192.0);
    col += vec3(0.5, 0.045, 0.03) * mist * smoothstep(0.3, 0.85, fb) *
      (0.07 + 0.12 * spin);
  }

  // feixes da varredura: do olho até a faixa de luz no chão
  if (scanOn > 0.0) {
    float gy = HZ - CAM / scanZ;
    float vis = step(scanZ, occZ);
    for (int j = 0; j < 5; j++) {
      float gxw = (float(j) - 2.0) * 4.2;
      vec2 G = vec2((gxw - camX) / scanZ, gy);
      float ld = segD(uv, E, G, pxs);
      col += vec3(1.0, 0.13, 0.07) * scanOn * vis *
        (exp(-ld * ld * 0.5) * 0.8 + exp(-ld * 0.25) * 0.1);
    }
  }

  // o olho: brilho, fachos de luz e clarão branco na vitória
  vec2 dv = uv - E;
  float er = length(dv * vec2(0.55, 1.0));
  float eyeI = 0.5 + 0.08 * sin(t * 1.7) + 0.55 * spin + 1.4 * wEnv;
  float shafts = 0.0;
  if (er < 1.3) {
    vec2 dir2 = dv / max(length(dv), 0.0001);
    float sh2 = vnoise(dir2 * 3.2 + vec2(t * 0.06, 0.0), 8192.0);
    shafts = sh2 * sh2 * sh2 * exp(-er * 4.5) * smoothstep(0.02, 0.07, er) *
      smoothstep(1.3, 0.9, er);
  }
  col += vec3(1.0, 0.16, 0.05) * (exp(-er * 26.0) * 0.75 + shafts * 0.5) * eyeI;
  col += HOT * exp(-er * 40.0) * wEnv * 1.5;

  // raio da vitória: tronco na ponta da pirâmide + arcos pela base das nuvens
  if (wEnv > 0.01) {
    vec2 S = vec2(E.x, E.y + 0.03);
    float k2 = clamp((1.06 - uv.y) / (1.06 - S.y), 0.0, 1.0);
    float sx = E.x + (zig(uv.y * 30.0 + 5.0) - 0.5) * 0.03 * (0.3 + k2);
    float d1 = abs(uv.x - sx) * pxs + step(uv.y, S.y) * 1000.0;
    float ax = abs(uv.x - E.x);
    float reach = clamp(tw * 6.0 + 0.12, 0.0, 1.0) * asp * 0.5;
    // arcos na altura do olho, pela faixa livre do cabeçalho
    float yc = E.y + 0.014 + ax * 0.02 +
      (zig(ax * 11.0 + step(E.x, uv.x) * 31.0) - 0.5) * 0.05 +
      (zig(ax * 43.0) - 0.5) * 0.01;
    float d2 = abs(uv.y - yc) * pxs + step(reach, ax) * 1000.0;
    float tip = smoothstep(reach, reach * 0.6, ax);
    float b = exp(-d1 * d1 * 0.3) + exp(-d2 * d2 * 0.4) * tip;
    float g = exp(-d1 * 0.18) + exp(-d2 * 0.25) * 0.6 * tip;
    col += (HOT * b * 1.3 + RED * g * 0.6) * wEnv;
  }

  // brasas subindo (três camadas de células, poucas acesas; mais nas bordas)
  float tm = mod(t, 600.0);
  float em = smoothstep(0.95, 0.1, uv.y) *
    mix(0.3, 1.0, smoothstep(0.3, 0.75, abs(uv.x)));
  for (int j = 0; j < 3; j++) {
    if (em <= 0.0) break;
    float fj = float(j);
    float sc = 7.0 + fj * 6.0;
    vec2 g = vec2(uv.x * sc + fj * 3.7, uv.y * sc - tm * (0.5 + fj * 0.3));
    vec2 id = floor(g);
    float h = hash21(id + fj * 31.7);
    if (h < 0.14) {
      vec2 o = vec2(hash21(id + 5.1), hash21(id + 9.3)) - 0.5;
      o.x += sin(tm * 1.1 + h * 60.0) * 0.2;
      vec2 f = fract(g) - 0.5 - o * 0.6;
      float d = length(f) * pxs / sc;
      float fl = 0.6 + 0.4 * sin(tm * (2.0 + h * 25.0) + h * 90.0);
      col += vec3(1.0, 0.38, 0.1) * exp(-d * d * (0.7 - fj * 0.18)) * fl * em;
    }
  }

  // granulação de VHS e vinheta
  float gr = hash21(gl_FragCoord.xy + fract(t * 7.0) * 311.0);
  col += (gr - 0.5) * 0.03;
  vec2 vq = gl_FragCoord.xy / u_res - 0.5;
  col *= 1.0 - 0.5 * dot(vq, vq);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`
