// HUD do traje (cantos de baixo), no estilo dos jogos de tiro em primeira
// pessoa: caixas escuras translúcidas com números laranja brilhando.
// Leituras que mudam com o ciclo do complexo ficam numa "fita" (hl-flip):
// as variantes empilhadas numa coluna que rola com uma animação só. As da
// roleta (hl-v-spin / hl-v-won) ficam por cima e só mudam de opacidade.

const DIGITS = '0123456789'.split('')

// coluna do hodômetro: fita 0–9 rolando com steps()
const Roll = ({ k }: { k: number }) => (
  <span className="hl-roll">
    <span className={`hl-roll-strip hl-roll-${k}`}>
      {DIGITS.map((d) => (
        <span key={d}>{d}</span>
      ))}
    </span>
  </span>
)

// fita de variantes: normal / apagão / tempestade (ou normal / tempestade);
// `cyc` = some quando a roleta mostra a própria leitura por cima
const Flip = ({
  items,
  kind,
  cyc = false,
}: {
  items: string[]
  kind: 2 | 3
  cyc?: boolean
}) => (
  <span className={cyc ? 'hl-flip hl-cyc' : 'hl-flip'}>
    <span className={`hl-flip-strip hl-flip-${kind}`}>
      {items.map((t, i) => (
        <span key={i} className={`hl-f${kind}-${i}`}>
          {t}
        </span>
      ))}
    </span>
  </span>
)

export default function Hud() {
  return (
    <>
      <div className="hl-hud hl-hud-l" aria-hidden="true">
        <div className="hl-stack hl-status">
          <Flip
            cyc
            kind={3}
            items={[
              '● SISTEMAS NOMINAIS',
              '▼ ENERGIA AUXILIAR',
              '◆ ANOMALIA DE RESSONÂNCIA',
            ]}
          />
          <span className="hl-v-spin">▲ ANOMALIA DETECTADA</span>
          <span className="hl-v-won">✓ SORTEIO CONCLUÍDO</span>
        </div>
        <div className="hl-boxes">
          <div className="hl-box">
            <small>SAÚDE</small>
            <b className="hl-cross" />
            <span className="hl-num">
              <Flip kind={2} items={['100', '73']} />
            </span>
          </div>
          <div className="hl-box">
            <small>TRAJE</small>
            <b className="hl-shield" />
            <span className="hl-num">
              <Flip kind={2} items={['100', '41']} />
            </span>
          </div>
        </div>
      </div>

      <div className="hl-hud hl-hud-r" aria-hidden="true">
        {/* aviso de item coletado quando a roleta para */}
        <div className="hl-pickup">
          <i className="hl-pickup-chip" />
          <span>+1 SORTEIO</span>
        </div>
        <div className="hl-boxes">
          <div className="hl-box hl-box-r">
            <small>VELOCIDADE</small>
            <span className="hl-stack hl-num">
              <span className="hl-v-cruise">042</span>
              <span className="hl-v-spin">168</span>
            </span>
            <em>km/h</em>
          </div>
          <div className="hl-box hl-box-r">
            <small>PERCURSO</small>
            <span className="hl-num hl-odo">
              04
              <Roll k={2} />
              <Roll k={1} />
              <Roll k={0} />
            </span>
            <em>m</em>
          </div>
        </div>
        <div className="hl-energy">
          <small>CARGA</small>
          <span className="hl-flip hl-bar">
            <span className="hl-flip-strip hl-flip-3">
              <i />
              <i className="hl-bar-dark" />
              <i className="hl-bar-storm" />
            </span>
          </span>
        </div>
      </div>
    </>
  )
}
