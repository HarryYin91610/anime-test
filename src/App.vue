<template lang="pug">
div#app
  //- 不同顺序播放
  div.button-wrap
    div.button(@click="playBall(1)")
      | normal
    div.button(@click="playBall(1, 'reverse', true)")
      | reverse
    div.button(@click="playBall(1, 'alternate', true)")
      | alternate
  
  div.demo-panel
    div.ball-1(id="ball1")

  //- 不同顺序播放
  div.button-wrap
    div.button(@click="playBall(2, 'alternate', true)")
      | play
    div.button(@click="pauseBall(2)")
      | pause
    div.button(@click="stopBall(2)")
      | stop
  
  div.demo-panel
    div.ball-1(id="ball2")

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AgileAnime from './lib/agile-anime'

@Component
export default class App extends Vue {
  anime1: AgileAnime | null = null
  anime2: AgileAnime | null = null

  playBall (index: number, dirt: string = 'normal', loop: boolean = false) {
    const self: any = this
    const anime = self['anime' + index]
    anime.direction = dirt
    anime.loop = loop
    if (anime.playing) {
      console.log('动画正在进行中...')
      return
    }
    anime && anime.play()
  }

  pauseBall (index: number) {
    const self: any = this
    const anime = self['anime' + index]
    anime && anime.pause()
  }

  stopBall (index: number) {
    const self: any = this
    const anime = self['anime' + index]
    anime && anime.stop()
  }

  mounted () {
    this.$nextTick(() => {
      const dom = document.querySelector('#app #ball1') as HTMLElement
      this.anime1 = new AgileAnime(dom, false, 'normal',
      (count) => {
        console.log(`第${count}次动画开始！！！`)
      },
      (sq) => {
        console.log(`动画阶段${sq}次执行中！！！`)
      },
      (count) => {
        console.log(`第${count}次动画完成！！！`)
      })
      this.anime1
      .animator(350, {
        translateX: 0,
        translateY: 0
      }, 'ease-in', 0, 0)
      .animator(350, {
        translateX: 100,
        translateY: 0
      }, 'ease-in')
      .animator(350, {
        translateX: 100,
        translateY: 100
      }, 'linear')
      .animator(350, {
        translateX: 0,
        translateY: 100
      }, 'ease-in-out')
      .animator(350, {
        translateX: 0,
        translateY: 0
      }, 'ease-out')

      const dom2 = document.querySelector('#app #ball2') as HTMLElement
      this.anime2 = new AgileAnime(dom2)
      this.anime2
      .animator(350, {
        translateX: 0,
        translateY: 0
      }, 'ease-in')
      .animator(350, {
        translateX: 100,
        translateY: 0
      }, 'ease-in', 0, 0)
      .animator(350, {
        translateX: 100,
        translateY: 100
      }, 'linear', 0, 0)
      .animator(350, {
        translateX: 0,
        translateY: 100
      }, 'ease-in-out', 0, 0)
      .animator(350, {
        translateX: 0,
        translateY: 0
      }, 'ease-out', 0, 0)
    })
  }
}
</script>

<style lang="stylus" scoped>
@keyframes move-x
  from
    transform translate(0, 0)
  to
    transform translate(100px, 0)

@keyframes move-y
  from
    transform translate(0, 0)
  to
    transform translate(0, 100px)

#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
  margin-top 60px
  .ball-1, .ball-2
    position absolute
    left 50%
    top 50%
    width 20px
    height 20px
    margin-left -10px
    margin-top -10px
    background-color red
    border-radius 50%
  .ball-1
    background-color #FF83FA
  .ball-2
    background-color blue
  
  .button-wrap
    display flex
    justify-content center
    .button
      position relative
      height 32px
      line-height 32px
      margin-right 60px
      padding 0 10px
      border-radius 5px
      font-size 16px
      font-weight bold
      color #ffffff
      background-color #00BFFF
      cursor pointer
      &:last-child
        margin-right 0
      &:hover
        background-color #0072ff
  
  .demo-panel
    position relative
    width 400px
    height 400px
    margin 0 auto 20px
    margin-top 10px
    background-color #E0EEEE
    box-shadow 2px 2px 5px 2px rgba(0,0,0,0.3)
    border-radius 10px
</style>
