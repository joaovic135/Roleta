import { useEffect } from 'react'

export function useClickOutside(
  refs: React.RefObject<HTMLElement | null>[],
  callback: () => void,
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideRefs = refs.some(
        (ref) => ref.current && ref.current.contains(event.target as Node),
      )

      if (!clickedInsideRefs) {
        callback()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [refs, callback])
}
