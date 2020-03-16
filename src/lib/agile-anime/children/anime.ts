/* ___ @HarryYin __ */
import { transformList } from '../setting'
import { getDefaultUnit, getUnit, getPureNumber, getKeyFromStyle, getValueFromStyle, getKeyList } from '../lib/utils'
import Tween from '../lib/tween'
import { IAnimeNode, TUpdating, ITween } from '../typings'
import BezierEasing from 'bezier-easing'

export default class Anime {
  public sequence: number = 0 // 动画序号
  public total: number = 0 // 动画总阶段数
  private target: HTMLElement // 动画操作的dom节点
  private duration: number = 0 // 动画持续时间(毫秒)
  private properties: IAnimeNode // 动画修改dom的属性
  private delay: number = 0 // 动画延时开始(毫秒)
  private endDelay: number = 0 // 动画结束延时(毫秒)
  private ease: string = '' // 动画时间函数
  public paused: boolean = false // 暂停动画
  public pausedStart: number = 0 // 暂停起始时间点
  private aId: number = 0 // requestAnimationFrame标示符
  private update?: TUpdating // 动画每帧回调
  private curPercent: number = 0 // 动画执行进度（百分比）

  // 初始化样式节点
  private startNode: IAnimeNode = {}
  // transform变换（记录dom实时样式值）
  private translateX: number | string = 0
  private translateY: number | string = 0
  private translateZ: number | string = 0
  private scaleX: number = 1
  private scaleY: number = 1
  private rotate: number | string = 0
  private rotateX: number | string = 0
  private rotateY: number | string = 0
  private rotateZ: number | string = 0

  constructor (
    sequence: number,
    target: HTMLElement,
    duration: number, properties: IAnimeNode,
    ease?: string, delay?: number, endDelay?: number,
    update?: TUpdating) {

    this.sequence = sequence
    this.target = target
    this.duration = duration || 0
    this.properties = properties
    this.delay = delay || 0
    this.endDelay = endDelay || 0
    this.ease = ease || 'linear'
    this.update = update
  }

  /* 初始化dom样式值 */
  private initStartNode (): void {
    const self: any = this

    const str: string | null = this.target.style.transform
    if (str) {
      // 从现有行内样式初始化
      str.split(' ').forEach((style) => {
        const key: string = getKeyFromStyle(style)
        if (style && transformList.indexOf(key) > -1) {
          const val: string = getValueFromStyle(style)
          const keylist = getKeyList(key)
          keylist.forEach((kitem) => {
            self[kitem] = val
            self.startNode[kitem] = self[kitem]
          })
        } else {
          console.log('不支持该样式修改：', key)
        }
      })
    } else {
      // 从properties初始化
      Object.keys(this.properties).forEach((key) => {
        const keylist = getKeyList(key)
        keylist.forEach((kitem) => {
          self[kitem] = kitem.indexOf('scale') > -1 ? 1 : 0
          self.startNode[kitem] = self[kitem]
        })
      })
    }
  }

  /* 播放动画 */
  public play (): Promise<Anime> {
    const self: Anime = this
    return new Promise((resolve, reject) => {
      let startTime: number = 0 // 动画开始时间点
      let pausedTime: number = 0 // 暂停时长
      // 缓动算法函数
      const tweenEasing = this.distinguishEase(this.ease)
      const easing = this.getCssEaseFunction(this.ease)

      function step (timestamp: number) {
        startTime = startTime || timestamp

        if (self.paused) {
          // 暂停动画，计算暂停时长
          pausedTime = timestamp - self.pausedStart
        } else {
          // 目前运动经过的时长
          const passed = (timestamp - pausedTime) - startTime
          // 缓动因子
          let p: number = passed > self.delay ? Math.min(1.0, (passed - self.delay) / self.duration) : 0
          p = typeof tweenEasing === 'undefined' && easing ? easing(p) : p
          self.curPercent = Math.floor(100 * (p + self.sequence - 1) / self.total)
          // 利用缓动因子和算法更新dom
          self.updateProperties(passed, p, tweenEasing)

          if (p >= 1.0 && passed > self.duration + self.delay + self.endDelay) {
            resolve(self)
          } else {
            self.aId = requestAnimationFrame(step)
          }
        }
        // 动画更新每一帧时回调
        self.update && self.update({sq: self.sequence, percent: self.curPercent })
      }
      // console.log('动画', this.sequence)

      this.initStartNode()
      self.aId = requestAnimationFrame(step)
    })
  }

  /* 暂停动画 */
  public pause (): void {
    this.paused = true
    this.pausedStart = Date.now()
  }

  /* 停止动画 */
  public stop (): void {
    cancelAnimationFrame(this.aId)
  }

  /* 获取tween算法函数 */
  private distinguishEase (ease: string) {
    return (Tween as ITween)[ease] || undefined
  }

  /* 获取css timing-function */
  private getCssEaseFunction (ease: string) {
    if (ease.includes('cubic-bezier')) {
      const params = ease.replace(/cubic-bezier\(/g, '').replace(/\)/g, '').split(',')
      if (params.length !== 4) {
        console.error('cubic-bezier参数个数不对！')
        return
      }
      return BezierEasing(Number(params[0]), Number(params[1]), Number(params[2]), Number(params[3]))
    }
    switch (ease) {
      case 'ease-in-out':
        return BezierEasing(0.94, 0.00, 0.34, 1.00)
      case 'ease-in':
        return BezierEasing(0.64, 0.02, 0.64, 0.40)
      case 'ease-out':
        return BezierEasing(0.10, 0.24, 0.25, 0.98)
    }
    return (p: number) => p
  }

  /* 更新属性 */
  private updateProperties (
    ts: number, percent: number,
    easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => {}): void {
    for (const key of Object.keys(this.properties)) {
      if (transformList.includes(key)) {
        this.updateTransform(ts, key, this.properties[key], percent, easing)
      } else {
        console.log('不支持该样式修改：', key)
      }
    }
  }

  /* 更新transform变化 */
  private updateTransform (
    ts: number, key: string, val: number |  string, percent: number,
    easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => {}): void {

    if (!this.target) { return }

    const self: any = this
    
    // 获取key值映射的属性列表
    const keylist = getKeyList(key)
    keylist.forEach((kitem) => {
      // 若变化属性不存在于startNode，则补充默认值
      if (!this.startNode[kitem]) {
        this.startNode[kitem] = kitem.indexOf('scale') > -1 ? 1 : 0 // 默认值
      }

      // 计算获取实时样式value
      const pureV = typeof val === 'string' ? getPureNumber(val) : val
      let unit = getUnit(val)
      if (typeof val === 'number' && !unit) {
        unit = getDefaultUnit(kitem)
      }
      if (getPureNumber(self[kitem]) !== pureV) {
        // 未达到目标值时
        const starV = getPureNumber(this.startNode[kitem])
        const num = easing ?
        easing(ts, starV, pureV - starV, this.duration) :
        self.getCurrentValue(kitem, pureV, self[kitem], percent)
        self[kitem] = num.toFixed(2) + unit
      } else {
        // 已达到目标值时
        self[kitem] = self.getOriginValue(kitem)
      }
    })

    // 更新dom样式
    let str = ''
    const skeyList = Object.keys(this.startNode)
    skeyList.forEach((skey, sindex) => {
      str += this.getTransformStr(skey)
      if (sindex < skeyList.length - 1) {
        str += ' '
      }
    })
    this.target.style.transform = str
  }

  /* 获取transform样式字符串 */
  private getTransformStr (key: string) {
    return `${key}(${(this as any)[key]})`
  }

  /* 根据缓动因子计算属性当前值 */
  private getCurrentValue (key: string, val: number, cur: number, p: number): number {
    const start = getPureNumber(this.startNode[key])
    return val >= start ? start + (val - start) * p : start - (start - val) * p
  }

  /* 获取dom属性现有值 */
  private getOriginValue (key: string): number | string {
    const str = this.target.style.transform
    let res = key.indexOf('scale') > -1 ? 1 : 0 // 默认值
    let unit = '' // 单位
    if (str) {
      str.split(' ').some((style, index) => {
        if (style.includes(key)) {
          const reg = new RegExp(`${key}\\((-?\\d+\\.?\\d*)(\\D*)\\)`, 'g')
          res = Number(style.replace(reg, '$1'))
          unit = style.replace(reg, '$2')
          return true
        }
        return false
      })
    }
    return key.indexOf('scale') > -1 ? res : res + unit
  }
}
