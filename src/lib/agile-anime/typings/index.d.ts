interface IAgileAnimeOptions {
  target: HTMLElement
  loop?: boolean
  direction?: DirtType
  begin?: TCallback
  update?: TUpdating
  complete?: TCallback
}

interface IAnimeOptions {
  duration: number
  properties: IAnimeNode
  ease?: string
  delay?: number
  endDelay?: number
}

interface IAnimeNode {
  translateX?: number
  translateY?: number
  translateZ?: number
  scale?: number
  scaleX?: number
  scaleY?: number
  rotate?: number
  rotateX?: number
  rotateY?: number
  rotateZ?: number
  [propName: string]: any
}

interface IUpdateOptions {
  sq: number
  percent: number
}

type DirtType = 'normal' | 'reverse' | 'alternate'

type TCallback = (count: number) => void
type TUpdating = ({sq, percent}: IUpdateOptions) => void

export { IAgileAnimeOptions, IAnimeOptions, DirtType, IAnimeNode, TCallback, TUpdating }
