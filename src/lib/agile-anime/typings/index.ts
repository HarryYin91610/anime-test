type DirtType = 'normal' | 'reverse' | 'alternate'

interface AnimeNode {
  translateX?: number
  translateY?: number
  translateZ?: number
  [propName: string]: any
}

export { DirtType, AnimeNode }
