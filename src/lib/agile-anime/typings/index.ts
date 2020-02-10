type DirtType = 'normal' | 'reverse' | 'alternate'

type TCallback = (count: number) => void
type TUpdating = (sq: number) => void

interface IAnimeNode {
  translateX?: number
  translateY?: number
  translateZ?: number
  scale?: number
  scaleX?: number
  scaleY?: number
  [propName: string]: any
}

export { DirtType, IAnimeNode, TCallback, TUpdating }
