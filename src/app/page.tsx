import RoletaMain from './components/RoletaMain'
import ThemeBackdrop from './components/ThemeBackdrop'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col lg:h-dvh lg:min-h-0">
      <ThemeBackdrop />
      <RoletaMain />
      <footer className="mt-auto shrink-0 pb-6 text-center text-xs text-slate-500 lg:flex lg:justify-center lg:gap-1.5 lg:pb-2">
        <p>Created by Joaovic135</p>
        <span className="hidden lg:inline">·</span>
        <p>To make life easer in JOGADORES em TREINAMENTO</p>
      </footer>
    </div>
  )
}
