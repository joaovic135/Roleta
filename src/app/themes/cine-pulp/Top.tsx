// Alto da sala: bambinela de veludo (sancas em arco com franja dourada e
// borlas) presa a uma cornija dourada, de ponta a ponta da tela. Um só
// <pattern> SVG repetido: estático, rasterizado uma vez.

const SW = 150
const SH = 46
// arco da sanca e as dobras paralelas a ele
const swag = (dy: number) =>
  `M0 ${8 + dy * 0.3}Q${SW / 2} ${58 + dy} ${SW} ${8 + dy * 0.3}`

export function Valance() {
  return (
    <svg className="cn-valance-art" aria-hidden="true">
      <defs>
        <linearGradient id="cn-swag-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a040c" />
          <stop offset="0.55" stopColor="#7e0e21" />
          <stop offset="1" stopColor="#4a0611" />
        </linearGradient>
        <linearGradient id="cn-cornice-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0bf" />
          <stop offset="0.4" stopColor="#d9a64a" />
          <stop offset="1" stopColor="#6b4513" />
        </linearGradient>
        <pattern
          id="cn-swag"
          x="50%"
          width={SW}
          height={SH}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M0 0H${SW}V${8}Q${SW / 2} 58 0 8Z`}
            fill="url(#cn-swag-g)"
          />
          <path
            d={swag(-30) + swag(-20) + swag(-11)}
            fill="none"
            stroke="rgba(10, 0, 2, 0.45)"
            strokeWidth="3"
          />
          <path
            d={swag(-25) + swag(-15) + swag(-6)}
            fill="none"
            stroke="rgba(255, 140, 140, 0.16)"
            strokeWidth="2.4"
          />
          {/* franja: traço largo tracejado ao longo da borda */}
          <path
            d={swag(0)}
            fill="none"
            stroke="#e7b85a"
            strokeWidth="7"
            strokeDasharray="1.1 1.5"
          />
          <path d={swag(-3.6)} fill="none" stroke="#8a5a18" strokeWidth="1.6" />
          {/* borla na emenda das sancas */}
          <path d="M-1.2 6h2.4v8h-2.4zM148.8 6h2.4v8h-2.4z" fill="#b8862e" />
          <ellipse cx="0" cy="17" rx="3.4" ry="3.4" fill="#f3cf7a" />
          <ellipse cx={SW} cy="17" rx="3.4" ry="3.4" fill="#f3cf7a" />
          <path
            d={`M-4 19h8l2.5 16h-13zM${SW - 4} 19h8l2.5 16h-13z`}
            fill="#d6a13f"
          />
          <path
            d={`M-6 34.5h12v2h-12zM${SW - 6} 34.5h12v2h-12z`}
            fill="#7a4d12"
          />
        </pattern>
      </defs>
      <rect width="100%" height={SH} fill="url(#cn-swag)" />
      <rect width="100%" height="7" fill="url(#cn-cornice-g)" />
      <rect y="7" width="100%" height="1.5" fill="#3a2006" />
    </svg>
  )
}
