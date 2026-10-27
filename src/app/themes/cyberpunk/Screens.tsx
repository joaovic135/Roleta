import { Box, TOWERS } from './geo'
import { cx, vars } from './City'

// Telões: dois painéis no topo (presos à agulha da arcologia, em unidades
// da camada distante) e um telão vertical em cada torre. Cada um passa três
// anúncios com transição de glitch (18 s por volta); girando a roleta todos
// cortam para "GIRANDO" e, quando ela para, mostram um 当 gigante na cor da
// fatia vencedora (pisca duas vezes e fica aceso, sem piscar mais).
// Tudo em HTML: as animações ficam em <div>, nunca dentro de um <svg>.

interface Slide {
  main: string
  sub: string
  icon?: 'lantern' | 'pastel' | 'wheel' | 'chip' | 'can' | 'mic' | 'jelly'
}
interface ScreenSpec {
  key: string
  cls: string
  box: Box
  hc: string
  delay: number
  vertical?: boolean
  slides: Slide[]
}

const SCREENS: ScreenSpec[] = [
  {
    key: 'bb-a',
    cls: 'cy-bb',
    box: { x: 946, y: 16, w: 202, h: 70 },
    hc: '#00f0ff',
    delay: -2,
    slides: [
      { main: '夜市', sub: 'LIBERDADE · FEIRA NOTURNA', icon: 'lantern' },
      { main: 'PASTEL', sub: 'DE FEIRA · 24H', icon: 'pastel' },
      { main: 'SORTE', sub: 'GIRE HOJE · 運試し', icon: 'wheel' },
    ],
  },
  {
    key: 'bb-b',
    cls: 'cy-bb',
    box: { x: 1252, y: 16, w: 202, h: 70 },
    hc: '#fcee0a',
    delay: -5,
    slides: [
      { main: '義体', sub: 'IMPLANTES EM 12X', icon: 'chip' },
      { main: 'GUARANÁ', sub: 'ZERO-G · 元気', icon: 'can' },
      { main: '노래방', sub: 'KARAOKÊ · BOM RETIRO', icon: 'mic' },
    ],
  },
  {
    key: 'vs-l',
    cls: 'cy-vs cy-vs-l',
    box: TOWERS[0].screen,
    hc: '#00f0ff',
    delay: -1,
    vertical: true,
    slides: [
      { main: 'ラーメン', sub: 'LAMEN' },
      { main: 'クラゲ', sub: 'AQUÁRIO', icon: 'jelly' },
      { main: '占い', sub: 'SORTE' },
    ],
  },
  {
    key: 'vs-r',
    cls: 'cy-vs cy-vs-r',
    box: TOWERS[1].screen,
    hc: '#fcee0a',
    delay: -9,
    vertical: true,
    slides: [
      { main: 'ホテル', sub: 'HOTEL' },
      { main: '未来', sub: 'FUTURO' },
      { main: 'ネオン', sub: 'NEO-SAMPA' },
    ],
  },
]

function Screen({ spec }: { spec: ScreenSpec }) {
  const { box, vertical } = spec
  // letras grandes cabem na altura do telão vertical
  const room = box.h / box.w - (vertical ? 0.55 : 0)
  return (
    <div
      className={cx('cy-scr', spec.cls)}
      style={vars({
        '--cy-x': box.x,
        '--cy-y': box.y,
        '--cy-w': box.w,
        '--cy-h': box.h,
        '--cy-hc': spec.hc,
      })}
    >
      {spec.slides.map((s, i) => {
        const chars = [...s.main].length
        const fs = vertical ? Math.min(0.66, room / chars) : undefined
        return (
          <div
            key={s.main}
            className={cx('cy-slide', i === 0 && 'cy-slide-first')}
            style={{ animationDelay: `${spec.delay - i * 6}s` }}
          >
            {s.icon && <i className={cx('cy-ic', `cy-ic-${s.icon}`)} />}
            <span className="cy-slide-txt">
              <b
                className={/^[\x20-\x7eÀ-ÿ]+$/.test(s.main) ? 'cy-lat' : ''}
                style={fs ? { fontSize: `${fs.toFixed(2)}em` } : undefined}
              >
                {s.main}
              </b>
              <small>{s.sub}</small>
            </span>
          </div>
        )
      })}
      <i
        className="cy-scr-glitch"
        style={{ animationDelay: `${spec.delay}s` }}
      />
      {/* surpresa rara: hackers tomam todos os telões por ~5 s */}
      <div className="cy-scr-hack">
        <b>{vertical ? 'ハック' : 'SINAL INVADIDO'}</b>
        <small>{vertical ? 'INVADIDO' : '// ハッキング中 · 해킹 //'}</small>
      </div>
      <div className="cy-scr-spin">
        <i className="cy-ic cy-ic-wheel cy-spinner" />
        <b>GIRANDO</b>
      </div>
      <div className="cy-scr-win">
        <b>当</b>
        <small>{vertical ? '大当たり' : 'VENCEDOR!'}</small>
      </div>
      <i className="cy-scr-scan" />
    </div>
  )
}

export function Billboards() {
  return (
    <>
      {SCREENS.slice(0, 2).map((s) => (
        <Screen key={s.key} spec={s} />
      ))}
    </>
  )
}

export function TowerScreens() {
  return (
    <>
      {SCREENS.slice(2).map((s) => (
        <Screen key={s.key} spec={s} />
      ))}
    </>
  )
}
