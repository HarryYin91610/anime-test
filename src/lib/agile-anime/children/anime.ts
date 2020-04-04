/* ___ @HarryYin __ */

import { transformList, propsList } from '../setting'
import Tween from '../lib/tween'
import { IAnimeNode, TUpdating, ITween, NumberGenerator, TweenFunction } from '../typings'
import { getCssEaseFunction } from '../lib/css-ease'
import {
  getDefaultUnit,
  getUnit,
  getPureNumber,
  getKeyFromStyle,
  getValueFromStyle,
  getKeyList,
  getMaxFromArray,
  getTransformOriginValue
} from '../lib/utils'

export default class Anime {
  public sequence: number = 0 // 动画序号
  public total: number = 0 // 动画总阶段数
  private targets: HTMLElement[] = [] // 动画操作的dom节点
  private duration: number[] = [] // 每个元素动画持续时间(毫秒)
  private properties: IAnimeNode // 动画修改dom的属性
  private delay: number[] = [] // 每个元素动画延时开始(毫秒)
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
  // 其他可变化属性
  private opacity: number[] = []

  constructor (
    sequence: number,
    targets: HTMLElement[],
    duration: number | NumberGenerator, properties: IAnimeNode,
    ease?: string, delay?: number | NumberGenerator,
    update?: TUpdating) {

    this.sequence = sequence
    this.targets = targets
    if (duration) {
      this.initTime(duration, this.duration)
    }
    this.properties = properties
    if (delay) {
      this.initTime(delay, this.delay)
    }
    this.ease = ease || 'linear'
    this.update = update
  }

  /* 初始化时间值：delay、duration */
  private initTime (time: number | NumberGenerator, list: number[]): void {
    if (typeof time === 'function') {
      this.targets.forEach((target, tindex) => {
        const num = time(target, tindex)
        list.push(num)
      })
    } else if (typeof time === 'number') {
      this.targets.forEach((target, tindex) => {
        list.push(time)
      })
    }
  }

  /* 初始化dom样式属性值缓存 */
  private initStartNode (): void {
    this.startNode = []
    this.targets.forEach((target, tindex) => {
      const self: any = this
      const transformStr: string = target.style.transform || ''
      const opacityStr: string = target.style.opacity || ''
      self.startNode.push({})

      // 从现有行内样式初始化transform
      if (transformStr) {
        transformStr.split(' ').forEach((style) => {
          const key: string = getKeyFromStyle(style)
          if (style && transformList.includes(key)) {
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
      }

      // 从现有行内样式初始化opacity
      if (opacityStr) {
        self['opacity'].splice(tindex, 1, Number(opacityStr))
        self.startNode[tindex]['opacity'] = self['opacity'][tindex]
      }

      // 为没有inline样式的属性设置默认值
      Object.keys(self.properties).forEach((key) => {
        const keylist = getKeyList(key)
        keylist.forEach((kitem) => {
          if ((propsList.includes(kitem)
          || transformList.includes(kitem))
          && self.startNode[tindex][kitem] === undefined) {
            self[kitem].splice(tindex, 1, ['scale', 'opacity'].includes(kitem) ? 1 : 0)
            self.startNode[tindex][kitem] = self[kitem][tindex]
          }
        })
      })
    })
  }

  /* 播放动画 */
  public play (): Promise<Anime> {
    const self: Anime = this
    return new Promise((resolve, reject) => {
      let startTime: number = 0 // 动画开始时间点
      let pausedTime: number = 0 // 暂停时长
      // 缓动算法函数
      const tweenEasing = self.distinguishEase(self.ease)
      const easing = getCssEaseFunction(self.ease)

      function step (timestamp: number) {
        startTime = startTime || timestamp

        if (self.paused) {
          // 暂停动画，计算暂停时长
          pausedTime = timestamp - self.pausedStart
        } else {
          // 目前运动经过的时长
          const passed = (timestamp - pausedTime) - startTime

          let totalP = 0

          // 更新每个dom
          self.targets.forEach((target, tindex) => {
            // 缓动因子
            const subDelay = self.delay[tindex] || 0
            const subDuration = self.duration[tindex] || 0
            const subPassed = passed > subDelay ? passed - subDelay : 0
            let p: number = subPassed ? Math.min(1.0, subPassed / subDuration) : 0
            p = typeof tweenEasing === 'undefined' && easing ? easing(p) : p
            totalP += p

            // 利用缓动因子和算法更新dom
            self.updateProperties(
              tindex,
              subPassed > subDuration ? subDuration : subPassed,
              p, tweenEasing)
          })

          totalP /= self.targets.length
          self.curPercent = Math.floor(100 * (totalP + self.sequence - 1) / self.total)

          // 计算总动画时长
          let totalTime = getMaxFromArray(self.duration).value || 0
          const maxDelayIndex = getMaxFromArray(self.delay).index
          if (maxDelayIndex > -1) {
            const maxDelay = self.delay[maxDelayIndex] || 0
            totalTime = self.duration[maxDelayIndex] + maxDelay
          }

          if (totalP >= 1.0 && passed > totalTime) {
            resolve(self)
          } else {
            self.aId = requestAnimationFrame(step)
          }
        }

        // 动画更新每一帧时回调
        self.update && self.update({ sq: self.sequence, percent: self.curPercent })
      }

      self.initStartNode()
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
  private distinguishEase (ease: string): TweenFunction | undefined {
    return (Tween as ITween)[ease] || undefined
  }

  /* 更新属性 */
  private updateProperties (
    tindex: number, ts: number, percent: number,
    easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => {}): void {

    for (const key of Object.keys(this.properties)) {
      const propV = this.properties[key]
      if (transformList.includes(key) && propV) {
        // 更新transform
        this.updateTransform(tindex, ts, key, propV, percent, easing)
      } else if (propsList.includes(key) && propV !== undefined) {
        // 更新其他属性
        switch (key) {
          case 'opacity':
          this.updateOpacity(tindex, ts, key, propV, percent, easing)
          break
          case 'color':
          case 'backgroundColor':
          break
        }
      } else {
        console.error('不支持该样式修改：', key)
      }
    }

    this.updateDomStyle(tindex)
  }

  /* 更新transform变化 */
  private updateTransform (
    tindex: number, ts: number, key: string, val: number |  string, percent: number,
    easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => {}): void {

    const self: any = this
    if (!self.targets || self.targets.length === 0) {
      console.error('target不能为空')
      return
    }

    // 获取key值映射的属性列表
    const keylist = getKeyList(key)
    keylist.forEach((kitem) => {
      // 若变化属性不存在于startNode，则补充默认值
      const startnode = self.startNode[tindex]
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
        const starV = getPureNumber(self.startNode[tindex][kitem])
        // 根据缓动因子计算属性值
        const num = easing ?
        easing(ts, starV, pureV - starV, self.duration[tindex]) :
        self.getCurrentValue(tindex, kitem, pureV, curVal, percent)
        // 更新属性值
        self[kitem][tindex] = num.toFixed(2) + unit
      } else {
        // 已达到目标值时
        self[kitem][tindex] = getTransformOriginValue(self.targets[tindex], kitem)
      }
    })
  }

  /* 更新opacity变化 */
  private updateOpacity (
    tindex: number, ts: number, key: string, val: number, percent: number,
    easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => {}): void {

    const self: any = this
    if (!self.targets || self.targets.length === 0) {
      console.error('target不能为空')
      return
    }

    const curVal = self[key][tindex]
    if (curVal !== undefined && curVal !== val) {
      // 未达到目标值时
      const starV = self.startNode[tindex][key]
      const num: number = easing ?
      easing(ts, starV, val - starV, self.duration[tindex]) :
      self.getCurrentValue(tindex, key, val, curVal, percent)

      self[key][tindex] = Number(num.toFixed(2))
    } else {
      // 已达到目标值时
      self[key][tindex] = Number(self.targets[tindex].style.opacity)
    }
  }

  /* 更新dom样式 */
  private updateDomStyle (tindex: number): void {
    const self: any = this
    const target = this.targets[tindex]

    if (self.startNode[tindex]) {
      const skeyList = Object.keys(self.startNode[tindex])
      let transformStr = ''
      skeyList.forEach((skey, sindex) => {
        if (transformList.includes(skey)) {
          transformStr += self.getTransformStr(tindex, skey)
          if (sindex < skeyList.length - 1) {
            transformStr += ' '
          }
        } else if (propsList.includes(skey)) {
          switch (skey) {
            case 'opacity':
            case 'borderRadius':
            case 'backgroundColor':
            case 'color':
              target.style[skey] = self[skey][tindex]
              break
          }
        }
      })

      target.style.transform = transformStr
    }
  }

  /* 获取transform样式字符串 */
  private getTransformStr (tindex: number, key: string): string {
    return `${key}(${(this as any)[key][tindex]})`
  }

  /* 根据缓动因子计算属性当前值 */
  private getCurrentValue (tindex: number, key: string, val: number, cur: number, p: number): number {
    const start = getPureNumber(this.startNode[tindex][key])
    return val >= start ? start + (val - start) * p : start - (start - val) * p
  }
}
