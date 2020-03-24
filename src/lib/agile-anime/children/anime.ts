/* ___ @HarryYin __ */

import { transformList } from '../setting'
import { getDefaultUnit, getUnit, getPureNumber, getKeyFromStyle, getValueFromStyle, getKeyList, getMaxFromArray } from '../lib/utils'
import Tween from '../lib/tween'
import { IAnimeNode, TUpdating, ITween, NumberGenerator } from '../typings'
import BezierEasing from 'bezier-easing'

export default class Anime {
  public sequence: number = 0 // 动画序号
  public total: number = 0 // 动画总阶段数
  private targets: HTMLElement[] = [] // 动画操作的dom节点
  private duration: number = 0 // 动画持续时间(毫秒)
  private properties: IAnimeNode // 动画修改dom的属性
  private delay: number[] = [] // 单个元素动画延时开始(毫秒)
  private ease: string = '' // 动画时间函数
  public paused: boolean = false // 暂停动画
  public pausedStart: number = 0 // 暂停起始时间点
  private aId: number = 0 // requestAnimationFrame标示符
  private update?: TUpdating // 动画每帧回调
  private curPercent: number = 0 // 动画执行进度（百分比）

  // 初始化样式节点
  private startNode: IAnimeNode[] = []
  // transform变换（记录dom实时样式值）
  private translateX: number[] | string[] = []
  private translateY: number[] | string[] = []
  private translateZ: number[] | string[] = []
  private scaleX: number[] = []
  private scaleY: number[] = []
  private rotate: number[] | string[] = []
  private rotateX: number[] | string[] = []
  private rotateY: number[] | string[] = []
  private rotateZ: number[] | string[] = []

  constructor (
    sequence: number,
    targets: HTMLElement[],
    duration: number, properties: IAnimeNode,
    ease?: string, delay?: number | NumberGenerator,
    update?: TUpdating) {

    this.sequence = sequence
    this.targets = targets
    this.duration = duration || 0
    this.properties = properties
    if (delay) {
      this.initDelays(delay, this.delay)
    }
    this.ease = ease || 'linear'
    this.update = update
  }

  /* 初始化delay值 */
  private initDelays (delay: number | NumberGenerator, list: number[]) {
    if (typeof delay === 'function') {
      this.targets.forEach((target, tindex) => {
        const num = delay(target, tindex)
        list.push(num)
      })
    } else if (typeof delay === 'number') {
      this.targets.forEach((target, tindex) => {
        list.push(delay)
      })
    }
  }

  /* 初始化dom样式值 */
  private initStartNode (): void {
    const self: any = this
    self.startNode = []

    this.targets.forEach((target, tindex) => {
      const str: string | null = target.style.transform
      self.startNode.push({})

      if (str) {
        // 从现有行内样式初始化
        str.split(' ').forEach((style) => {
          const key: string = getKeyFromStyle(style)
          if (style && transformList.indexOf(key) > -1) {
            const val: string = getValueFromStyle(style)
            const keylist = getKeyList(key)
            keylist.forEach((kitem) => {
              self[kitem].splice(tindex, 1, val)
              self.startNode[tindex][kitem] = self[kitem][tindex]
            })
          } else {
            console.error('不支持该样式修改：', key)
          }
        })
      } else {
        // 从properties初始化
        Object.keys(this.properties).forEach((key) => {
          const keylist = getKeyList(key)
          keylist.forEach((kitem) => {
            self[kitem].splice(tindex, 1, kitem.indexOf('scale') > -1 ? 1 : 0)
            self.startNode[tindex][kitem] = self[kitem][tindex]
          })
        })
      }
    })
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

          let totalP = 0
          self.targets.forEach((target, tindex) => {
            // 缓动因子
            const subDelay = self.delay[tindex] || 0
            const subPassed = passed > subDelay ? passed - subDelay : 0
            let p: number = subPassed ? Math.min(1.0, subPassed / self.duration) : 0
            p = typeof tweenEasing === 'undefined' && easing ? easing(p) : p
            totalP += p
            // 利用缓动因子和算法更新dom
            self.updateProperties(
              tindex,
              subPassed > self.duration ? self.duration : subPassed,
              p, tweenEasing)
          })

          totalP /= self.targets.length
          self.curPercent = Math.floor(100 * (totalP + self.sequence - 1) / self.total)
          const maxDelay = getMaxFromArray(self.delay) || 0

          if (totalP >= 1.0 && passed > self.duration + maxDelay) {
            resolve(self)
          } else {
            self.aId = requestAnimationFrame(step)
          }
        }

        // 动画更新每一帧时回调
        self.update && self.update({ sq: self.sequence, percent: self.curPercent })
      }
      // console.error('动画', this.sequence)

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
    tindex: number, ts: number, percent: number,
    easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => {}): void {
    for (const key of Object.keys(this.properties)) {
      if (transformList.includes(key)) {
        this.updateTransform(tindex, ts, key, this.properties[key], percent, easing)
      } else {
        console.error('不支持该样式修改：', key)
      }
    }
  }

  /* 更新transform变化 */
  private updateTransform (
    tindex: number, ts: number, key: string, val: number |  string, percent: number,
    easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => {}): void {

    if (!this.targets || this.targets.length === 0) {
      console.error('target不能为空')
      return
    }

    const self: any = this
    const target = this.targets[tindex]

    // 获取key值映射的属性列表
    const keylist = getKeyList(key)
    keylist.forEach((kitem) => {
      // 若变化属性不存在于startNode，则补充默认值
      const startnode = this.startNode[tindex]
      if (!startnode || !startnode[kitem]) {
        startnode[kitem] = kitem.indexOf('scale') > -1 ? 1 : 0 // 默认值
      }

      // 计算获取实时样式value
      const pureV = typeof val === 'string' ? getPureNumber(val) : val
      let unit = getUnit(val)
      if (typeof val === 'number' && !unit) {
        unit = getDefaultUnit(kitem)
      }

      const curVal = self[kitem][tindex]
      if (curVal && getPureNumber(curVal) !== pureV) {
        // 未达到目标值时
        const starV = getPureNumber(this.startNode[tindex][kitem])
        const num = easing ?
        easing(ts, starV, pureV - starV, this.duration) :
        self.getCurrentValue(tindex, kitem, pureV, curVal, percent)
        self[kitem][tindex] = num.toFixed(2) + unit
      } else {
        // 已达到目标值时
        self[kitem][tindex] = self.getOriginValue(tindex, kitem)
      }
    })

    // 更新dom样式
    let str = ''
    const skeyList = Object.keys(this.startNode[tindex])
    skeyList.forEach((skey, sindex) => {
      str += this.getTransformStr(tindex, skey)
      if (sindex < skeyList.length - 1) {
        str += ' '
      }
    })
    target.style.transform = str
  }

  /* 获取transform样式字符串 */
  private getTransformStr (tindex: number, key: string) {
    return `${key}(${(this as any)[key][tindex]})`
  }

  /* 根据缓动因子计算属性当前值 */
  private getCurrentValue (tindex: number, key: string, val: number, cur: number, p: number): number {
    const start = getPureNumber(this.startNode[tindex][key])
    return val >= start ? start + (val - start) * p : start - (start - val) * p
  }

  /* 获取dom属性现有值 */
  private getOriginValue (tindex: number, key: string): number | string {
    const str = this.targets[tindex].style.transform
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
