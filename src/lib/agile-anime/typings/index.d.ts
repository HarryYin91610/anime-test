type DirtType = 'normal' | 'reverse' | 'alternate'
type TargetType = HTMLElement | HTMLElement[] | string | string[]
type TCallback = (count: number) => void
type TUpdating = ({sq, percent}: IUpdateOptions) => void
type NumberGenerator = (el: HTMLElement, i: number) => number

interface IAgileAnimeOptions {
  target: TargetType
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
  delay?: number | NumberGenerator
}

interface IAnimeNode {
  translateX?: number | string
  translateY?: number | string
  translateZ?: number | string
  scale?: number
  scaleX?: number
  scaleY?: number
  rotate?: number | string
  rotateX?: number | string
  rotateY?: number | string
  rotateZ?: number | string
  [propName: string]: any
}

interface IUpdateOptions {
  sq: number
  percent: number
}

interface ITween {
  [propName: string]: (t: number, b: number, c: number, d: number, s?: number, a?: number, p?: number) => number
}

export class Anime {
  public sequence: number // 动画序号
  public total: number // 动画总阶段数
  private target: HTMLElement | string // 动画操作的dom节点
  private duration: number // 动画持续时间(毫秒)
  private properties: IAnimeNode // 动画修改dom的属性
  private delay: number // 动画延时开始(毫秒)
  private ease: string // 动画时间函数
  public paused: boolean // 暂停动画
  public pausedStart: number // 暂停起始时间点
  private aId: number // requestAnimationFrame标示符
  private update?: TUpdating // 动画每帧回调
  private curPercent: number // 动画执行进度（百分比）

  // 起点
  private startNode: IAnimeNode
  // transform变换
  private translateX: number
  private translateY: number
  private translateZ: number
  private scaleX: number
  private scaleY: number
  private rotate: number
  private rotateX: number
  private rotateY: number
  private rotateZ: number

  constructor(sequence: number,
    target: HTMLElement,
    duration: number, properties: IAnimeNode,
    ease?: string, delay?: number,
    update?: TUpdating)

  initStartNode(): void
  play(): Promise<Anime>
  pause(): void
  stop(): void
}

export { IAgileAnimeOptions, IAnimeOptions, DirtType, TargetType, NumberGenerator, IAnimeNode, TCallback, TUpdating, ITween }
