/* ___ @HarryYin __ */

import './lib/polyfill'
import Anime from './children/anime'
import { DirtType } from './typings'

export default class AgileAnime {
  private target: HTMLElement // 动画操作的dom节点
  private loop?: boolean = false // 是否循环
  private direction?: DirtType = 'normal' // 动画播放的方向：normal 正向，reverse 反向，alternate 奇数次正向 && 偶数次反向

  private animeQueue: Anime[] = []
  public playing: boolean = false

  constructor (target: HTMLElement, loop?: boolean, direction?: DirtType) {
    this.target = target
    this.loop = loop
    this.direction = direction
  }

  public animator (
    duration: number, properties: object,
    ease?: string, delay?: number, endDelay?: number,
    begin?: () => {}, update?: () => {}, complete?: () => {}): AgileAnime {
    const sq: number = this.animeQueue.length
    const anime: Anime = new Anime(
    sq, this.target, duration, properties,
    begin, update, complete, ease,
    delay, endDelay)
    this.animeQueue.push(anime)
    return this
  }

  public async play () {
    try {
      this.playing = true
      for (const i in this.animeQueue) {
        if (this.animeQueue[i]) {
          const res = await this.animeQueue[i].play()
        }
      }
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

  // public pause () {}

  // public stop () {}

  private resetNode () {
    this.target.style.transform = ''
  }
}
