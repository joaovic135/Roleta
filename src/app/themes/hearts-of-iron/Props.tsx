// Objetos da mesa nas margens (posição e tamanho no CSS, em unidades de
// 1/1080 da altura da tela: var(--hoi-u)). Desenhos em SVG estático com
// luz vinda da luminária de cima; o que se mexe é sempre um <div>/<span>
// próprio por cima do desenho.

// ---- despachos do teletipo (lidos de cima para baixo, o mais novo no
// topo; os 12 primeiros se repetem no fim para o laço não ter emenda) ----
export const DISPATCHES = [
  '0417 URGENTE · SETOR 7',
  'PONTE DE TARNEL TOMADA',
  '3A DIVISAO EM MARCHA',
  'VELMORA AINDA RESISTE',
  'CHUVA FORTE AO NORTE',
  'RADAR: 3 CONTATOS NE',
  'COMBOIO 12 CHEGOU OK',
  'FERROVIA CORTADA KM 40',
  'PEDIDO: MAIS MUNICAO',
  'BRASK SOB NEBLINA',
  'PATRULHA VOLTOU 0 BAIXAS',
  'AGUARDANDO ORDENS',
  'CIFRA ALTERADA 06H00',
  'PORTO BIGORNA SEGURO',
  'SINAL FRACO EM DUNHAL',
  'FIM DA MENSAGEM ////',
]
const TTY_LINES = [
  ...[...DISPATCHES].reverse(),
  ...[...DISPATCHES].reverse().slice(0, 12),
]
const RACE_LINES = [
  'ALERTA ALERTA ALERTA',
  'ROLETA EM GIRO',
  'TODAS AS UNIDADES',
  'AGUARDEM O SORTEIO',
  '>>>>>>>>>>>>>>>>>>>>',
  'PRIORIDADE MAXIMA',
  'CANAL ABERTO · 7',
  'ALVO SENDO DEFINIDO',
]

export function Teletype() {
  return (
    <div className="hoi-prop hoi-tty">
      {/* papel saindo da boca da máquina */}
      <div className="hoi-tty-paper">
        <div className="hoi-tty-window">
          <div className="hoi-tty-calm">
            <div className="hoi-tty-col">
              {TTY_LINES.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
            {/* papel em branco cobrindo a linha que ainda está sendo batida */}
            <span className="hoi-tty-cover" />
            <span className="hoi-tty-head" />
          </div>
          <div className="hoi-tty-race">
            <div className="hoi-tty-racecol">
              {[...RACE_LINES, ...RACE_LINES].map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <svg className="hoi-tty-body" viewBox="0 0 200 180" aria-hidden="true">
        <defs>
          <linearGradient id="hoi-tty-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#58614c" />
            <stop offset="0.5" stopColor="#3b4233" />
            <stop offset="1" stopColor="#23281e" />
          </linearGradient>
          <linearGradient id="hoi-tty-roll" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1a1a14" />
            <stop offset="0.45" stopColor="#5a5848" />
            <stop offset="0.6" stopColor="#2a2a20" />
            <stop offset="1" stopColor="#0e0e0a" />
          </linearGradient>
          <linearGradient id="hoi-tty-sheet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bdb293" />
            <stop offset="1" stopColor="#e9e0c4" />
          </linearGradient>
        </defs>
        {/* sombra na mesa */}
        <path d="M14 22h184v162h-184z" fill="rgba(0,0,0,0.45)" />
        {/* carcaça */}
        <rect
          x="6"
          y="6"
          width="190"
          height="150"
          rx="14"
          fill="url(#hoi-tty-metal)"
        />
        <rect
          x="6"
          y="6"
          width="190"
          height="150"
          rx="14"
          fill="none"
          stroke="rgba(230,226,190,0.22)"
          strokeWidth="1.5"
        />
        {/* rolo de papel atrás */}
        <rect x="22" y="14" width="160" height="30" rx="8" fill="#d9cfb0" />
        <rect
          x="22"
          y="14"
          width="160"
          height="30"
          rx="8"
          fill="url(#hoi-tty-sheet)"
          opacity="0.6"
        />
        <path d="M22 29h160" stroke="rgba(60,50,30,0.25)" strokeWidth="1" />
        <rect x="12" y="20" width="12" height="18" rx="3" fill="#8a7a4a" />
        <rect x="180" y="20" width="12" height="18" rx="3" fill="#8a7a4a" />
        {/* tampa com venezianas */}
        <rect x="18" y="52" width="166" height="62" rx="6" fill="#2a3024" />
        <path
          d="M30 62h142M30 70h142M30 78h142M30 86h142M30 94h142M30 102h142"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth="3"
        />
        <path
          d="M30 64h142M30 72h142M30 80h142M30 88h142M30 96h142M30 104h142"
          stroke="rgba(220,220,180,0.12)"
          strokeWidth="1"
        />
        {/* plaqueta de latão */}
        <rect x="70" y="118" width="62" height="13" rx="2" fill="#b8913f" />
        <text x="101" y="128" className="hoi-tty-plate">
          TELEX · T-7
        </text>
        {/* platina: boca por onde sai o papel */}
        <rect
          x="16"
          y="136"
          width="170"
          height="20"
          rx="4"
          fill="url(#hoi-tty-roll)"
        />
        <rect x="14" y="140" width="10" height="12" rx="2" fill="#c9a24a" />
        <rect x="178" y="140" width="10" height="12" rx="2" fill="#c9a24a" />
        {/* lâmpada de linha (acende de verdade por cima, no CSS) */}
        <circle cx="168" cy="124" r="5" fill="#3a1c06" />
        <circle cx="168" cy="124" r="3" fill="#ffb347" />
        {/* reflexo na carcaça */}
        <path
          d="M20 12q80 -6 160 0"
          stroke="rgba(255,240,200,0.25)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span className="hoi-tty-lamp" />
    </div>
  )
}

export function Radar() {
  return (
    <div className="hoi-prop hoi-radar">
      <div className="hoi-radar-screen">
        <span className="hoi-radar-sweep" />
        <span className="hoi-radar-sweep hoi-radar-fast" />
        <span className="hoi-blip" />
        <span className="hoi-blip" />
        <span className="hoi-blip" />
        <span className="hoi-blip" />
      </div>
      <svg className="hoi-radar-bezel" viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <linearGradient id="hoi-brass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3dc9a" />
            <stop offset="0.3" stopColor="#b8913f" />
            <stop offset="0.55" stopColor="#6e521c" />
            <stop offset="0.8" stopColor="#c9a24a" />
            <stop offset="1" stopColor="#4a3612" />
          </linearGradient>
          <radialGradient id="hoi-glass" cx="35%" cy="28%" r="70%">
            <stop offset="0" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="0.35" stopColor="rgba(255,255,255,0.03)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle
          cx="200"
          cy="200"
          r="190"
          fill="none"
          stroke="url(#hoi-brass)"
          strokeWidth="18"
        />
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="#241a08"
          strokeWidth="3"
        />
        <circle
          cx="200"
          cy="200"
          r="199"
          fill="none"
          stroke="#241a08"
          strokeWidth="2"
        />
        {/* parafusos */}
        {[0, 60, 120, 180, 240, 300].map((a) => {
          const x = 200 + Math.cos((a * Math.PI) / 180) * 190
          const y = 200 + Math.sin((a * Math.PI) / 180) * 190
          return (
            <g key={a}>
              <circle cx={x} cy={y} r="4.5" fill="#3a2c10" />
              <circle cx={x - 0.8} cy={y - 0.8} r="3" fill="#e2c57a" />
              <path
                d={`M${x - 2.4} ${y}h4.8`}
                stroke="#3a2c10"
                strokeWidth="1"
                transform={`rotate(${a + 30} ${x} ${y})`}
              />
            </g>
          )
        })}
        {/* marcas de rumo no aro */}
        <g className="hoi-radar-marks">
          <text x="200" y="36">
            0
          </text>
          <text x="368" y="204">
            9
          </text>
          <text x="200" y="372">
            18
          </text>
          <text x="34" y="204">
            27
          </text>
        </g>
        <circle cx="200" cy="200" r="176" fill="url(#hoi-glass)" />
        <path
          d="M78 118a150 150 0 0 1 120 -70"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export function Dossier() {
  return (
    <div className="hoi-prop hoi-dossier">
      <svg viewBox="0 0 260 420" aria-hidden="true">
        <defs>
          <linearGradient id="hoi-manila" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d9bb7e" />
            <stop offset="0.6" stopColor="#c4a165" />
            <stop offset="1" stopColor="#9c7a44" />
          </linearGradient>
          <linearGradient id="hoi-sheet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f1e8cf" />
            <stop offset="1" stopColor="#d8ccab" />
          </linearGradient>
          <linearGradient id="hoi-photo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b8b80" />
            <stop offset="1" stopColor="#4a4a44" />
          </linearGradient>
        </defs>
        <path
          d="M30 40L250 30L254 404L28 412Z"
          fill="rgba(0,0,0,0.22)"
          transform="translate(14 16)"
        />
        <path
          d="M30 40L250 30L254 404L28 412Z"
          fill="rgba(0,0,0,0.35)"
          transform="translate(6 8)"
        />
        {/* pasta */}
        <path d="M20 34L238 24L246 398L22 406Z" fill="url(#hoi-manila)" />
        <path d="M150 26L236 22L238 6L160 10Z" fill="#c9aa6e" />
        <text x="196" y="19" className="hoi-dos-tab">
          OP. ROLETA
        </text>
        {/* folha datilografada saindo da pasta */}
        <path d="M6 22L196 14L204 236L12 244Z" fill="url(#hoi-sheet)" />
        <g className="hoi-dos-type" transform="rotate(-2.4 100 120)">
          <text x="22" y="44" className="hoi-dos-head">
            RELATÓRIO DE CAMPO
          </text>
          <path d="M22 50h150" stroke="rgba(40,30,15,0.6)" strokeWidth="1" />
          <text x="22" y="68">
            Nº 0417 · SETOR 7
          </text>
          <text x="22" y="84">
            SITUAÇÃO: CERCO EM CURSO
          </text>
          <text x="22" y="100">
            REFORÇOS: A CAMINHO
          </text>
          <text x="22" y="116">
            CLIMA: VARIÁVEL
          </text>
          <text x="22" y="132">
            ALVO: A SORTEAR
          </text>
          <path
            d="M22 150h120M22 164h96M22 178h132"
            stroke="rgba(40,30,15,0.28)"
            strokeWidth="5"
          />
        </g>
        {/* carimbo CONFIDENCIAL */}
        <g transform="rotate(-9 110 214)" className="hoi-dos-stamp">
          <rect x="44" y="198" width="132" height="30" rx="2" />
          <rect x="48" y="202" width="124" height="22" rx="1" />
          <text x="110" y="219">
            CONFIDENCIAL
          </text>
        </g>
        {/* foto aérea de reconhecimento presa com clipe */}
        <g transform="rotate(5 188 96)">
          <rect x="140" y="52" width="96" height="86" fill="#eee6cf" />
          <rect x="146" y="58" width="84" height="66" fill="url(#hoi-photo)" />
          <path
            d="M146 92q30 -10 50 6t34 -4v30h-84z"
            fill="rgba(30,30,28,0.55)"
          />
          <path
            d="M152 64h20v14h-20zM176 64h12v20h-12zM196 70h22v10h-22zM158 100h16v12h-16z"
            fill="rgba(200,200,190,0.35)"
          />
          <path
            d="M146 84q40 10 84 -4"
            stroke="#bfc6c2"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="204"
            cy="94"
            r="10"
            fill="none"
            stroke="#c4402a"
            strokeWidth="2"
          />
          <text x="188" y="134" className="hoi-dos-cap">
            VELMORA · 06H
          </text>
        </g>
        <path
          d="M176 44v-18a6 6 0 0 1 12 0v30a4 4 0 0 1 -8 0v-24"
          fill="none"
          stroke="#c8ccd0"
          strokeWidth="2.4"
        />
        {/* botões e barbante do envelope */}
        <circle cx="128" cy="300" r="11" fill="#8c6a36" />
        <circle cx="128" cy="300" r="7" fill="#a98447" />
        <circle cx="128" cy="356" r="11" fill="#8c6a36" />
        <circle cx="128" cy="356" r="7" fill="#a98447" />
        <path
          d="M128 300L140 356L116 300L128 356M128 356q-30 20 -60 10"
          fill="none"
          stroke="#9b2d1f"
          strokeWidth="1.8"
        />
        {/* anel de café */}
        <circle
          cx="72"
          cy="340"
          r="28"
          fill="none"
          stroke="rgba(110,64,20,0.35)"
          strokeWidth="4"
        />
        <text x="214" y="392" className="hoi-dos-num">
          Nº 0417
        </text>
      </svg>
    </div>
  )
}

export function Lamp() {
  return (
    <div className="hoi-prop hoi-lamp">
      <svg viewBox="0 0 260 190" aria-hidden="true">
        <defs>
          <linearGradient id="hoi-emerald" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#06281a" />
            <stop offset="0.28" stopColor="#156b43" />
            <stop offset="0.44" stopColor="#7fe0a8" />
            <stop offset="0.56" stopColor="#1f8150" />
            <stop offset="0.86" stopColor="#0a3c25" />
            <stop offset="1" stopColor="#ffd98a" />
          </linearGradient>
          <linearGradient id="hoi-lampbrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6e3a6" />
            <stop offset="0.5" stopColor="#b8913f" />
            <stop offset="1" stopColor="#5a4214" />
          </linearGradient>
          <radialGradient id="hoi-lampbase" cx="38%" cy="30%" r="80%">
            <stop offset="0" stopColor="#fbeab4" />
            <stop offset="0.35" stopColor="#c9a24a" />
            <stop offset="0.8" stopColor="#6e521c" />
            <stop offset="1" stopColor="#3a2a0c" />
          </radialGradient>
        </defs>
        <g transform="rotate(-14 130 95)">
          {/* base pesada de latão, vista de cima, com a sombra na mesa */}
          <rect
            x="64"
            y="106"
            width="140"
            height="68"
            rx="20"
            fill="rgba(0,0,0,0.5)"
          />
          <rect
            x="56"
            y="96"
            width="140"
            height="66"
            rx="18"
            fill="url(#hoi-lampbase)"
          />
          <rect
            x="66"
            y="105"
            width="120"
            height="48"
            rx="12"
            fill="none"
            stroke="rgba(255,240,200,0.35)"
            strokeWidth="1.5"
          />
          <circle cx="176" cy="142" r="6" fill="#3a2c10" />
          <circle cx="175" cy="141" r="3" fill="#e9cf86" />
          {/* cúpula de vidro esmeralda */}
          <path
            d="M14 52q116 -30 232 0l6 44q-122 24 -244 0z"
            fill="url(#hoi-emerald)"
          />
          <path
            d="M22 58q108 -26 216 0"
            stroke="rgba(220,255,230,0.55)"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="2"
            y="48"
            width="16"
            height="52"
            rx="4"
            fill="url(#hoi-lampbrass)"
          />
          <rect
            x="242"
            y="48"
            width="16"
            height="52"
            rx="4"
            fill="url(#hoi-lampbrass)"
          />
          <circle cx="130" cy="44" r="7" fill="url(#hoi-lampbrass)" />
          {/* corrente de puxar */}
          <path
            d="M196 100v24"
            stroke="#c9a24a"
            strokeWidth="1.6"
            strokeDasharray="2 2"
          />
          <circle cx="196" cy="128" r="3.5" fill="#e2c57a" />
        </g>
      </svg>
    </div>
  )
}

export function Ashtray() {
  return (
    <div className="hoi-prop hoi-ashtray">
      <svg viewBox="0 0 160 140" aria-hidden="true">
        <defs>
          <radialGradient id="hoi-tray" cx="45%" cy="40%" r="60%">
            <stop offset="0" stopColor="#2a2418" />
            <stop offset="0.7" stopColor="#1a160e" />
            <stop offset="0.82" stopColor="#c9a24a" />
            <stop offset="0.9" stopColor="#f0d891" />
            <stop offset="1" stopColor="#5a4214" />
          </radialGradient>
        </defs>
        <ellipse cx="64" cy="76" rx="56" ry="50" fill="rgba(0,0,0,0.5)" />
        <circle cx="58" cy="68" r="52" fill="url(#hoi-tray)" />
        <path
          d="M36 70q8 -10 18 -2t20 2q6 10 -6 14t-22 -2q-12 -2 -10 -12z"
          fill="#6b675c"
        />
        <path
          d="M48 58l26 6M40 80l20 -4"
          stroke="#d8d2c0"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M48 58l6 1.4M40 80l5 -1"
          stroke="#b07a3a"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* cigarro apoiado na borda */}
        <path
          d="M84 60L150 34"
          stroke="#2a2418"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M86 58L150 32"
          stroke="#f2ede0"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M134 38L150 32"
          stroke="#c98f4a"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M86 58L92 55.6"
          stroke="#8a8478"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
      <span className="hoi-ember" />
      <span className="hoi-smoke" />
      <span className="hoi-smoke" />
      <span className="hoi-smoke" />
    </div>
  )
}

export function Mug() {
  return (
    <div className="hoi-prop hoi-mug">
      <svg viewBox="0 0 140 120" aria-hidden="true">
        <defs>
          <radialGradient id="hoi-coffee" cx="40%" cy="38%" r="62%">
            <stop offset="0" stopColor="#5a3418" />
            <stop offset="0.7" stopColor="#2a160a" />
            <stop offset="1" stopColor="#150a04" />
          </radialGradient>
        </defs>
        <ellipse cx="62" cy="66" rx="50" ry="48" fill="rgba(0,0,0,0.5)" />
        <path
          d="M98 46q30 -2 30 16t-30 16"
          fill="none"
          stroke="#1d2f52"
          strokeWidth="11"
        />
        <path
          d="M98 46q30 -2 30 16t-30 16"
          fill="none"
          stroke="#e9e4d6"
          strokeWidth="7"
        />
        <circle cx="58" cy="60" r="46" fill="#1d2f52" />
        <circle cx="58" cy="60" r="42" fill="#ece6d6" />
        <circle cx="58" cy="60" r="35" fill="url(#hoi-coffee)" />
        <ellipse
          cx="46"
          cy="48"
          rx="12"
          ry="5"
          fill="rgba(255,226,170,0.35)"
          transform="rotate(-24 46 48)"
        />
        <path
          d="M76 88q10 -6 12 -18"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          fill="none"
        />
        {/* lascas no esmalte */}
        <path d="M22 72l3 2M90 30l2 3" stroke="#1d2f52" strokeWidth="3" />
      </svg>
      <span className="hoi-steam" />
      <span className="hoi-steam" />
    </div>
  )
}

export function Compass() {
  return (
    <div className="hoi-prop hoi-compass">
      <svg viewBox="0 0 200 160" aria-hidden="true">
        <defs>
          <radialGradient id="hoi-cbrass" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#f6e3a6" />
            <stop offset="0.5" stopColor="#b8913f" />
            <stop offset="1" stopColor="#4a3612" />
          </radialGradient>
        </defs>
        {/* compasso de pontas (divisor) aberto ao lado */}
        <path
          d="M150 20L118 150M150 20L196 140"
          stroke="rgba(0,0,0,0.45)"
          strokeWidth="6"
          transform="translate(4 5)"
        />
        <path
          d="M150 20L118 150M150 20L196 140"
          stroke="#c9a24a"
          strokeWidth="4"
        />
        <path
          d="M150 20L118 150M150 20L196 140"
          stroke="#f3dc9a"
          strokeWidth="1.2"
        />
        <circle cx="150" cy="20" r="7" fill="url(#hoi-cbrass)" />
        {/* bússola */}
        <circle cx="70" cy="86" r="60" fill="rgba(0,0,0,0.5)" />
        <circle cx="64" cy="80" r="58" fill="url(#hoi-cbrass)" />
        <circle cx="64" cy="80" r="48" fill="#e9dfc2" />
        <circle
          cx="64"
          cy="80"
          r="48"
          fill="none"
          stroke="#3a2c10"
          strokeWidth="1.5"
        />
        <path
          className="hoi-compass-ticks"
          d={Array.from({ length: 36 }, (_, i) => {
            const a = (i / 36) * Math.PI * 2
            const r0 = i % 9 === 0 ? 36 : 41
            return `M${(64 + Math.cos(a) * r0).toFixed(1)} ${(80 + Math.sin(a) * r0).toFixed(1)}L${(64 + Math.cos(a) * 46).toFixed(1)} ${(80 + Math.sin(a) * 46).toFixed(1)}`
          }).join('')}
        />
        <g className="hoi-compass-letters">
          <text x="64" y="50">
            N
          </text>
          <text x="96" y="84">
            L
          </text>
          <text x="64" y="118">
            S
          </text>
          <text x="32" y="84">
            O
          </text>
        </g>
        <circle
          cx="64"
          cy="22"
          r="7"
          fill="none"
          stroke="url(#hoi-cbrass)"
          strokeWidth="4"
        />
        <ellipse
          cx="50"
          cy="58"
          rx="20"
          ry="9"
          fill="rgba(255,255,255,0.25)"
          transform="rotate(-30 50 58)"
        />
      </svg>
      <span className="hoi-needle" />
    </div>
  )
}

export function Phone() {
  return (
    <div className="hoi-prop hoi-phone">
      <div className="hoi-phone-ring">
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <defs>
            <radialGradient id="hoi-bakelite" cx="40%" cy="30%" r="80%">
              <stop offset="0" stopColor="#4a4a46" />
              <stop offset="0.4" stopColor="#1a1a18" />
              <stop offset="1" stopColor="#050505" />
            </radialGradient>
          </defs>
          <path
            d="M30 40h120l14 120h-148z"
            fill="rgba(0,0,0,0.5)"
            transform="translate(6 8)"
          />
          <path
            d="M34 38h112q8 0 10 10l10 104q0 10 -10 10h-132q-10 0 -10 -10l10 -104q2 -10 10 -10z"
            fill="url(#hoi-bakelite)"
          />
          {/* disco */}
          <circle cx="90" cy="108" r="40" fill="#121210" />
          <circle
            cx="90"
            cy="108"
            r="38"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
          />
          {Array.from({ length: 10 }, (_, i) => {
            const a = ((i * 30 - 210) * Math.PI) / 180
            return (
              <circle
                key={i}
                cx={(90 + Math.cos(a) * 28).toFixed(1)}
                cy={(108 + Math.sin(a) * 28).toFixed(1)}
                r="6.5"
                fill="#e9e1c9"
              />
            )
          })}
          <circle cx="90" cy="108" r="14" fill="#e9e1c9" />
          <text x="90" y="106" className="hoi-phone-label">
            OPER.
          </text>
          <text x="90" y="114" className="hoi-phone-label">
            2-17
          </text>
          {/* fone no gancho */}
          <path
            d="M24 30q66 -16 132 0"
            stroke="#050505"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="28" cy="32" rx="18" ry="14" fill="url(#hoi-bakelite)" />
          <ellipse cx="152" cy="32" rx="18" ry="14" fill="url(#hoi-bakelite)" />
          <path
            d="M30 24q60 -14 120 0"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="2"
            fill="none"
          />
          {/* fio enrolado saindo para a borda */}
          <path
            d="M164 120c10 0 10 8 0 8c10 0 10 8 0 8c10 0 10 8 0 8c10 0 10 8 0 8c10 0 14 10 18 20"
            stroke="#0a0a0a"
            strokeWidth="3"
            fill="none"
          />
        </svg>
      </div>
      <svg className="hoi-phone-waves" viewBox="0 0 180 180" aria-hidden="true">
        <path d="M8 18q-8 14 0 28M-2 12q-12 20 0 40M172 18q8 14 0 28M182 12q12 20 0 40" />
      </svg>
    </div>
  )
}

export function Legend() {
  return (
    <div className="hoi-prop hoi-legend">
      <span className="hoi-tape" />
      <b>Legenda</b>
      <svg viewBox="0 0 130 104" aria-hidden="true">
        <path d="M4 10h24" className="hoi-lg-red" />
        <path d="M8 10l3 -6l3 6M18 10l3 -6l3 6" className="hoi-lg-redfill" />
        <path d="M4 30h24" className="hoi-lg-hatch" />
        <path d="M4 50h24" className="hoi-lg-blue" />
        <path d="M4 70h24" className="hoi-lg-rail" />
        <path
          d="M6 72v-4M11 72v-4M16 72v-4M21 72v-4M26 72v-4"
          className="hoi-lg-rail"
        />
        <rect x="6" y="84" width="20" height="13" className="hoi-lg-unit" />
        <path
          d="M9 87h14v7h-14zM9 87l14 7M23 87l-14 7"
          className="hoi-lg-unitx"
        />
        <text x="36" y="13">
          Kessária
        </text>
        <text x="36" y="33">
          Ocupado
        </text>
        <text x="36" y="53">
          Liga de Vandrel
        </text>
        <text x="36" y="73">
          Ferrovia
        </text>
        <text x="36" y="94">
          Infantaria
        </text>
      </svg>
      <i>Escala 1:250.000</i>
      <span className="hoi-scale" />
    </div>
  )
}

// carimbo de VITÓRIA (só existe na vitória; a cor vem de --win-color)
export function Stamp() {
  return (
    <div className="hoi-stamp" aria-hidden="true">
      {/* tira de papel (telas menores: o carimbo bate no topo da carta) */}
      <span className="hoi-stamp-slip" />
      <span className="hoi-stamp-ring" />
      <svg className="hoi-stamp-mark" viewBox="0 0 280 120">
        <defs>
          <filter id="hoi-ink" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="2"
              seed="7"
              result="n"
            />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.7 0 0 0 1.8"
              result="m"
            />
            <feComposite in="SourceGraphic" in2="m" operator="in" />
          </filter>
        </defs>
        <g filter="url(#hoi-ink)">
          <rect
            x="6"
            y="6"
            width="268"
            height="108"
            rx="6"
            className="hoi-stamp-b1"
          />
          <rect
            x="16"
            y="16"
            width="248"
            height="88"
            rx="3"
            className="hoi-stamp-b2"
          />
          <text x="140" y="76" className="hoi-stamp-word">
            VITÓRIA
          </text>
          <text x="140" y="98" className="hoi-stamp-sub">
            ALVO SORTEADO · ROLETA
          </text>
          <path d="M40 30h200" className="hoi-stamp-b2" />
        </g>
      </svg>
      <svg className="hoi-stamp-tool" viewBox="0 0 280 160">
        <rect x="20" y="40" width="240" height="84" rx="8" fill="#2a1a0e" />
        <rect x="26" y="34" width="228" height="80" rx="8" fill="#7a4a24" />
        <rect x="26" y="34" width="228" height="20" rx="8" fill="#9a6a3a" />
        <circle cx="140" cy="74" r="40" fill="#3a2210" />
        <circle cx="140" cy="70" r="36" fill="#a8743e" />
        <circle cx="128" cy="58" r="14" fill="rgba(255,230,180,0.35)" />
        <rect x="98" y="104" width="84" height="8" rx="2" fill="#c9a24a" />
      </svg>
    </div>
  )
}
