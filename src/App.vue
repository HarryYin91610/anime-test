<template lang="pug">
div#app
  //- 不同顺序播放
  div.button-wrap
    div.button(@click="playBall(1)")
      | normal
    //- div.button(@click="playBall(1, 'reverse', false)")
    //-   | reverse
    //- div.button(@click="playBall(1, 'alternate', true)")
    //-   | alternate
    div.button(@click="pauseBall(1)")
      | pause
    div.button(@click="stopBall(1)")
      | stop
  div.demo-panel
    div.ball-1(id="ball1")
    div.ball-1(id="ball2")
    div.ball-1(id="ball3")
    div.ball-1(id="ball4")

  //- 播放、暂停、停止
  //- div.button-wrap
  //-   div.button(@click="playBall(2, 'alternate', true)")
  //-     | play
  //-   div.button(@click="pauseBall(2)")
  //-     | pause
  //-   div.button(@click="stopBall(2)")
  //-     | stop
  //- div.demo-panel
  //-   div.ball-1(id="ball2")

  //- scale变化
  //- div.button-wrap
  //-   div.button(@click="playBall(3, 'alternate', true)")
  //-     | play
  //-   div.button(@click="pauseBall(3)")
  //-     | pause
  //-   div.button(@click="stopBall(3)")
  //-     | stop
  //- div.demo-panel
  //-   div.ball-1(id="ball3")

  //- rotate变化
  //- div.button-wrap
  //-   div.button(@click="playBall(4, 'alternate', true)")
  //-     | play
  //-   div.button(@click="pauseBall(4)")
  //-     | pause
  //-   div.button(@click="stopBall(4)")
  //-     | stop
  //- div.demo-panel
  //-   div.ball-2(id="ball4") ball

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AgileAnime from './lib/agile-anime'

@Component
export default class App extends Vue {
  anime1: AgileAnime | null = null

  playBall (index: number, dirt: string = 'normal', loop: boolean = true) {
    const self: any = this
    const anime = self['anime' + index]
    anime.direction = dirt
    // anime.loop = loop
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
      const list: HTMLElement[] = [
        document.querySelector('#app #ball1') as HTMLElement,
        document.querySelector('#app #ball4') as HTMLElement
      ]
      this.anime1 = new AgileAnime({
        target: ['#app #ball1', '#app #ball2', '#app #ball3', '#app #ball4'],
        loop: 1,
        // target: '#app #ball1'
        // target: list
      })

      this.anime1
      .animator({
        duration: 150,
        properties: {
          translateY: -180
        }
      })
      .animator({
        ease: 'bounceEaseOut',
        duration: 1050,
        delay: (el, i) => {
          return i * 150
        },
        properties: {
          translateY: 150
        }
      })
      .animator({
        duration: 150,
        ease: 'linear',
        delay: (el, i) => {
          return i * 150
        },
        properties: {
          scale: 2,
          borderRadius: '0%',
          color: '#FFFF00',
          backgroundColor: '#FFA500'
        }
      })
      .animator({
        ease: 'elasticEaseOut',
        duration: (el, i) => {
          return 1000 + i * 150
        },
        properties: {
          scale: 1,
          color: '#ffffff',
          backgroundColor: '#00FFFF'
        }
      })
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
    width 30px
    height 30px
    margin-right 10px
    background-color red
    color #ffffff
    border-radius 50%
  .ball-1
    background-color #FF83FA
  .ball-2
    width 40px
    height 40px
    line-height 40px
    color #ffffff
    background-color #FF4040
  
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
    display flex
    justify-content center
    align-items center
    margin-top 10px
    background-color #E0EEEE
    box-shadow 2px 2px 5px 2px rgba(0,0,0,0.3)
    border-radius 10px
</style>
