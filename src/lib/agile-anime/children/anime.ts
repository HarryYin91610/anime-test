/* ___ @HarryYin __ */

import { transformList } from '../setting'
import { Elastic, Bounce, Back } from './tween'
import { IAnimeNode, TUpdating } from '../typings'
import BezierEasing from 'bezier-easing'

export default class Anime {
  public sequence: number = 0 // 动画序号
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

  // 起点
  private startNode: IAnimeNode = {}
  // transform变换
  private translateX: number = 0
  private translateY: number = 0
  private translateZ: number = 0

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

  /* 初始化dom信息 */
  private initStartNode () {
    const self: any = this

    self.startNode = {
      translateX: this.getOriginValue('translateX'),
      translateY: this.getOriginValue('translateY'),
      translateZ: this.getOriginValue('translateZ')
    }
    Object.keys(self.startNode).forEach((key, index) => {
      self[key] = self.startNode[key]
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

        // 动画更新每一帧时回调
        self.update && self.update(self.sequence)

        if (self.paused) {
          // 暂停动画，计算暂停时长
          pausedTime = timestamp - self.pausedStart
        } else {
          // 目前运动经过的时长
          const passed = (timestamp - pausedTime) - startTime
          // 缓动因子
          let p: number = passed > self.delay ? Math.min(1.0, (passed - self.delay) / self.duration) : 0
          p = typeof tweenEasing === 'undefined' && easing ? easing(p) : p

          // 利用缓动因子和算法更新dom
          self.updateProperties(passed, p, tweenEasing)

          if (p >= 1.0 && passed > self.duration + self.delay + self.endDelay) {
            resolve(self)
          } else {
            self.aId = requestAnimationFrame(step)
          }
        }
      }
      // console.log('动画', this.sequence)

      this.initStartNode()
      self.aId = requestAnimationFrame(step)
    })
  }

  /* 暂停动画 */
  public pause () {
    this.paused = true
    this.pausedStart = Date.now()
  }

  /* 停止动画 */
  public stop () {
    cancelAnimationFrame(this.aId)
  }

  /* 获取tween算法函数 */
  private distinguishEase (ease: string) {
    switch (ease) {
      case 'elasticEaseIn':
        return Elastic.easeIn
      case 'elasticEaseOut':
        return Elastic.easeOut
      case 'elasticEaseInOut':
        return Elastic.easeInOut
      case 'bounceEaseIn':
        return Bounce.easeIn
      case 'bounceEaseOut':
        return Bounce.easeOut
      case 'bounceEaseInOut':
        return Bounce.easeInOut
      case 'backEaseIn':
        return Back.easeIn
      case 'backEaseOut':
        return Back.easeOut
      case 'backEaseInOut':
        return Back.easeInOut
    }
    return undefined
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
    easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => {}) {
    for (const key of Object.keys(this.properties)) {
      if (transformList.includes(key)) {
        this.updateTransform(ts, key, this.properties[key], percent, easing)
      }
    }
  }

  /* 更新transform变化 */
  private updateTransform (
    ts: number, key: string, val: number, percent: number,
    easing?: (t: number, b: number, c: number, d: number, a?: number, p?: number) => {}) {
    if (!this.target) { return }
    // translate变化
    if (key.includes('translate')) {
      const self: any = this
      if (self[key] !== val) {
        self[key] = easing ?
          easing(ts, this.startNode[key], val - this.startNode[key], this.duration) :
          self.getCurrentValue(key, val, self[key], percent)
      } else {
        self[key] = self.getOriginValue(key)
      }

      this.target.style.transform = `translateX(${this.translateX}px) translateY(${this.translateY}px) translateZ(${this.translateZ}px)`
    }
    // if (key.includes('rotate')) {}
    // if (key.includes('scale')) {}
    // if (key.includes('skew')) {}
    // if (key.includes('perspective')) {}
  }

  /* 根据缓动因子计算属性当前值 */
  private getCurrentValue (key: string, val: number, cur: number, p: number) {
    const start = this.startNode[key]
    return val >= start ? start + (val - start) * p : start - (start - val) * p
  }

  /* 获取dom属性原始值 */
  private getOriginValue (key: string) {
    const str = this.target.style.transform
    let res = 0
    if (str) {
      str.split(' ').some((type, index) => {
        if (type.includes(key)) {
          const reg = new RegExp(`${key}\\((-?\\d+\\.?\\d*)\\D+\\)`, 'g')
          res = Number(type.replace(reg, '$1'))
          return true
        }
        return false
      })
    }
    return res
  }
}
