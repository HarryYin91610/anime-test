/* ___ @HarryYin __ */

import './lib/polyfill'
import Anime from './children/anime'
import { DirtType } from './typings'

export default class AgileAnime {
  private target: HTMLElement // 动画操作的dom节点
  public loop?: boolean = false // 是否循环
  private count: number = 0 // 当前播放次数
  public direction?: DirtType = 'normal' // 动画播放的方向：normal 正向，reverse 反向，alternate 奇数次正向 && 偶数次反向

  private animeQueue: Anime[] = [] // 动画序列
  public playing: boolean = false // 播放状态
  private curAsq: number = 0 // 当前播放的动画序号：从1开始的整数，0 没有播放动画

  constructor (target: HTMLElement, loop?: boolean, direction?: DirtType) {
    this.target = target
    this.loop = loop
    this.direction = direction || 'normal'
  }

  /* 创造一个动画节点 */
  public animator (
    duration: number, properties: object,
    ease?: string, delay?: number, endDelay?: number,
    begin?: () => {}, update?: () => {}, complete?: () => {}): AgileAnime {
    const sq: number = this.animeQueue.length + 1
    const anime: Anime = new Anime(
    sq, this.target, duration, properties,
    begin, update, complete, ease,
    delay, endDelay)
    this.animeQueue.push(anime)
    return this
  }

  /* 播放动画 */
  public async play () {
    try {
      // 暂停状态不计数
      if (this.curAsq <= 0) {
        this.count++
      }
      this.playing = true
      // 初始化curAsq（当前播放的动画序号）
      if (this.curAsq <= 0) {
        this.curAsq = (this.direction === 'alternate' && this.count % 2 === 0) ||
        this.direction === 'reverse' ? this.animeQueue.length - 1 : 0
      }
      // 播放完整动画
      switch (this.direction) {
        case 'reverse':
          await this.playReverse()
          break
        case 'alternate':
          if (this.count % 2 === 0) {
            await this.playReverse()
          } else {
            await this.playNormal()
          }
          break
        case 'normal':
        default:
          await this.playNormal()
      }
      // 完整动画播放结束
      this.curAsq = 0
      if (this.loop) {
        this.resetNode()
        this.play()
      } else {
        this.playing = false
      }
    } catch (e) {
      console.log(e)
    }
  }

  /* 正序播放动画 */
  private async playNormal () {
    for (const i in this.animeQueue) {
      if (this.animeQueue[i]) {
        const anime = this.animeQueue[i]
        // 暂停后搜索继续播放的动画序号
        if (anime.sequence === this.curAsq) {
          anime.paused = false
        }
        if (anime.sequence >= this.curAsq) {
          this.curAsq = anime.sequence
          await anime.play()
        }
      }
    }
  }

  /* 倒序播放动画 */
  private async playReverse () {
    for (let i = this.animeQueue.length - 1; i >= 0; i--) {
      const anime = this.animeQueue[i]
      // 暂停后搜索继续播放的动画序号
      if (anime && anime.sequence === this.curAsq) {
        anime.paused = false
      }
      if (anime && anime.sequence <= this.curAsq) {
        this.curAsq = anime.sequence
        await anime.play()
      }
    }
  }

  /* 暂停动画 */
  public pause () {
    this.playing = false
    this.animeQueue.some((anime) => {
      if (anime.sequence === this.curAsq) {
        anime.pause()
        return true
      }
      return false
    })
  }

  /* 停止动画 */
  public stop () {
    this.animeQueue.forEach((anime) => {
      if (anime.sequence === this.curAsq) {
        anime.stop()
        this.curAsq = 0
        this.playing = false
        this.count = 0
        this.resetNode()
      }
      anime.paused = false
      anime.pausedStart = 0
    })
  }

  /* 重置target样式 */
  private resetNode () {
    this.target.style.transform = ''
  }
}
