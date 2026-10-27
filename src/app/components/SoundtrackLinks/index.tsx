'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import React, { useEffect, useId, useRef, useState } from 'react'
// Só o tipo: o módulo em si usa as chaves do Spotify e fica no servidor
import type { Soundtrack } from '@/app/utils/spotify'

interface SoundtrackLinksProps {
  tmdbId: number
  title: string
  variant?: 'full' | 'compact'
}

const DAY = 24 * 60 * 60 * 1000

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300'

const external = { target: '_blank', rel: 'noopener noreferrer' } as const

// Mesmo link do servidor, repetido aqui para não puxar spotify.ts para o
// bundle do cliente
const searchUrl = (title: string) =>
  'https://open.spotify.com/search/' + encodeURIComponent(title + ' soundtrack')

const duration = (ms: number) => {
  const seconds = Math.round(ms / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

async function fetchSoundtrack(
  tmdbId: number,
  title: string,
  signal: AbortSignal,
): Promise<Soundtrack> {
  const params = new URLSearchParams({
    tmdbId: String(tmdbId),
    title: title.slice(0, 200),
  })
  const response = await fetch(`/api/soundtrack?${params}`, { signal })
  if (!response.ok) throw new Error(`trilha: ${response.status}`)
  return response.json()
}

// Bolinha verde: o único toque da cor do Spotify
const SpotifyDot = () => (
  <span
    aria-hidden="true"
    className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#1ed760]"
  />
)

const linkClass = `inline-flex items-center gap-1.5 rounded text-sm font-semibold text-amber-300 underline-offset-2 transition hover:text-amber-200 hover:underline ${focusRing}`

function SearchLink({ title, url }: { title: string; url?: string }) {
  return (
    <a href={url ?? searchUrl(title)} {...external} className={linkClass}>
      <SpotifyDot />
      Procurar no Spotify
      <span aria-hidden="true">↗</span>
    </a>
  )
}

function SoundtrackBody({
  title,
  data,
  isError,
}: {
  title: string
  data: Soundtrack | undefined
  isError: boolean
}) {
  if (isError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-400">
          Não deu para buscar a trilha agora.
        </p>
        <SearchLink title={title} />
      </div>
    )
  }

  if (!data) {
    return (
      <p className="flex items-center gap-2 text-sm text-slate-400">
        <span
          aria-hidden="true"
          className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-amber-300"
        />
        Procurando a trilha…
      </p>
    )
  }

  if (data.kind === 'search') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-400">
          Não achamos o álbum da trilha no Spotify.
        </p>
        <SearchLink title={title} url={data.url} />
      </div>
    )
  }

  if (data.kind === 'playlist') {
    const { playlist } = data
    return (
      <div className="flex items-start gap-3">
        {playlist.image && (
          <Image
            src={playlist.image}
            alt=""
            width={56}
            height={56}
            unoptimized
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
        )}
        <div className="min-w-0 space-y-1">
          <a href={playlist.url} {...external} className={linkClass}>
            <SpotifyDot />
            <span className="min-w-0">
              Playlist da comunidade: {playlist.name}
            </span>
            <span aria-hidden="true">↗</span>
          </a>
          {/* O Spotify não lista as faixas de playlists de terceiros */}
          <p className="text-xs text-slate-400">
            Montada por {playlist.owner}, não é o álbum oficial.
          </p>
        </div>
      </div>
    )
  }

  const { album, tracks } = data
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {album.image && (
          <Image
            src={album.image}
            alt={`Capa de ${album.name}`}
            width={72}
            height={72}
            unoptimized
            className="h-[72px] w-[72px] shrink-0 rounded-md object-cover shadow-lg"
          />
        )}
        <div className="min-w-0 space-y-1">
          <p className="font-semibold leading-snug text-slate-100">
            {album.name}
          </p>
          <p className="text-xs text-slate-400">
            {album.artists.join(', ')}
            {album.year && ` · ${album.year}`}
          </p>
          <a href={album.url} {...external} className={linkClass}>
            <SpotifyDot />
            Abrir álbum no Spotify
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      {tracks.length > 0 && (
        <ol
          aria-label={`Faixas de ${album.name}`}
          className="max-h-72 overflow-y-auto overscroll-contain rounded-lg border border-white/10 bg-slate-950/40 p-1"
        >
          {tracks.map((track) => (
            <li key={track.id}>
              <a
                href={track.url}
                {...external}
                className={`grid grid-cols-[2.5ch_1fr_auto] items-baseline gap-2 rounded-md px-2 py-1.5 text-sm text-slate-200 transition hover:bg-white/10 ${focusRing}`}
              >
                <span className="text-right text-xs tabular-nums text-slate-500">
                  {track.number}
                </span>
                <span className="truncate">{track.name}</span>
                <span className="text-xs tabular-nums text-slate-400">
                  {duration(track.durationMs)}
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

// Só o resumo vai para a região viva: com o corpo inteiro, o leitor de tela
// leria as dezenas de faixas de uma vez quando a busca termina
function statusText(data: Soundtrack | undefined, isError: boolean) {
  if (isError) return 'Não deu para buscar a trilha agora.'
  if (!data) return 'Procurando a trilha…'
  if (data.kind === 'album') return `Trilha encontrada: ${data.album.name}`
  if (data.kind === 'playlist') {
    return `Playlist encontrada: ${data.playlist.name}`
  }
  return 'Não achamos o álbum da trilha no Spotify.'
}

const SoundtrackLinks: React.FC<SoundtrackLinksProps> = ({
  tmdbId,
  title,
  variant = 'full',
}) => {
  // Nada é buscado antes do clique: a cota do Spotify é curta
  const [requested, setRequested] = useState(false)
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { data, isError } = useQuery({
    queryKey: ['soundtrack', tmdbId],
    queryFn: ({ signal }) => fetchSoundtrack(tmdbId, title, signal),
    enabled: requested,
    staleTime: DAY,
    gcTime: DAY,
  })

  // Clique no fundo (fora do conteúdo) fecha; Esc o <dialog> já resolve
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onClick = (e: MouseEvent) => {
      if (e.target === dialog) dialog.close()
    }
    const onClose = () => {
      setOpen(false)
      triggerRef.current?.focus()
    }
    dialog.addEventListener('click', onClick)
    dialog.addEventListener('close', onClose)
    return () => {
      dialog.removeEventListener('click', onClick)
      dialog.removeEventListener('close', onClose)
    }
  }, [variant, requested])

  // No primeiro clique o <dialog> ainda não existe; abre depois de montar
  useEffect(() => {
    const dialog = dialogRef.current
    if (open && dialog && !dialog.open) dialog.showModal()
  }, [open, requested])

  // O <dialog> modal não trava a rolagem: a roda sobre o fundo descia a página
  useEffect(() => {
    if (variant !== 'compact' || !open) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [variant, open])

  const toggle = () => {
    setRequested(true)
    if (variant === 'compact') {
      setOpen(true)
      dialogRef.current?.showModal()
    } else {
      setOpen((value) => !value)
    }
  }

  const body = (
    <>
      <p className="sr-only" aria-live="polite">
        {statusText(data, isError)}
      </p>
      <SoundtrackBody title={title} data={data} isError={isError} />
    </>
  )

  if (variant === 'compact') {
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          onClick={toggle}
          aria-label={`Trilha sonora de ${title}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          title="Trilha sonora"
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white ${focusRing}`}
        >
          <span aria-hidden="true">♫</span>
        </button>

        {/* Só entra no HTML depois do primeiro clique: são dezenas de botões
            na página e cada <dialog> pesa ~1,4 kB */}
        {requested && (
          <dialog
            ref={dialogRef}
            aria-labelledby={`${panelId}-title`}
            className="ui-card m-auto max-h-[85vh] w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-0 text-slate-100 shadow-2xl backdrop:bg-slate-950/75"
          >
            <div className="flex max-h-[85vh] flex-col gap-4 overflow-y-auto overscroll-contain p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    id={`${panelId}-title`}
                    className="ui-card-title text-lg font-bold"
                  >
                    Trilha sonora
                  </h2>
                  <p className="truncate text-sm text-slate-400">{title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  aria-label="Fechar"
                  className={`shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white ${focusRing}`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {/* Só monta com o modal aberto, para o leitor de tela não pegar
                o conteúdo escondido */}
              {open && <div>{body}</div>}
            </div>
          </dialog>
        )}
      </>
    )
  }

  return (
    <div className="min-w-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={`inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 ${focusRing} ${
          open ? 'bg-white/10' : ''
        }`}
      >
        <span aria-hidden="true">♫</span>
        Trilha sonora
        <span
          aria-hidden="true"
          className={`text-xs text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className="mt-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-left"
        >
          {body}
        </div>
      )}
    </div>
  )
}

export default SoundtrackLinks
