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

  //- 播放、暂停、停止
  div.button-wrap
    div.button(@click="playBall(2, 'alternate', true)")
      | play
    div.button(@click="pauseBall(2)")
      | pause
    div.button(@click="stopBall(2)")
      | stop
  div.demo-panel
    div.ball-1(id="ball2")

  //- scale变化
  div.button-wrap
    div.button(@click="playBall(3, 'alternate', true)")
      | play
    div.button(@click="pauseBall(3)")
      | pause
    div.button(@click="stopBall(3)")
      | stop
  div.demo-panel
    div.ball-1(id="ball3")

  //- rotate变化
  div.button-wrap
    div.button(@click="playBall(4, 'alternate', true)")
      | play
    div.button(@click="pauseBall(4)")
      | pause
    div.button(@click="stopBall(4)")
      | stop
  div.demo-panel
    div.ball-2(id="ball4") ball

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import AgileAnime from './lib/agile-anime'

@Component
export default class App extends Vue {
  anime1: AgileAnime | null = null
  anime2: AgileAnime | null = null
  anime3: AgileAnime | null = null
  anime4: AgileAnime | null = null

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
      this.anime1 = new AgileAnime({
        target: dom,
        loop: false,
        direction: 'normal',
        // begin: (count) => {
        //   console.log(`第${count}次动画开始！！！`)
        // },
        // update: ({sq, percent}) => {
        //   console.log(`动画阶段${sq}次执行进度${percent}%！！！`)
        // },
        // complete: (count) => {
        //   console.log(`第${count}次动画完成！！！`)
        // }
      })
      this.anime1
      .animator({
        duration: 350,
        properties: {
          translateX: 0,
          translateY: 0
        },
        ease: 'ease-in',
        delay: 0,
        endDelay: 0
      })
      .animator({
        duration: 350,
        properties: {
          translateX: 100,
          translateY: 0
        },
        ease: 'backEaseInOut'
      })
      // .animator({
      //   duration: 350,
      //   properties: {
      //     translateX: 100,
      //     translateY: 100
      //   },
      //   ease: 'linear'
      // })
      // .animator({
      //   duration: 350,
      //   properties: {
      //     translateX: 0,
      //     translateY: 100
      //   },
      //   ease: 'ease-in-out'
      // })
      // .animator({
      //   duration: 350,
      //   properties: {
      //     translateX: 0,
      //     translateY: 0
      //   },
      //   ease: 'ease-out'
      // })

      const dom2 = document.querySelector('#app #ball2') as HTMLElement
      this.anime2 = new AgileAnime({target: dom2})
      this.anime2
      .animator({
        duration: 350,
        properties: {
          translateX: 0,
          translateY: 0
        },
        ease: 'ease-in'
      })
      .animator({
        duration: 350,
        properties: {
          translateX: 100,
          translateY: 0
        },
        ease: 'ease-in'
      })
      .animator({
        duration: 350,
        properties: {
          translateX: 100,
          translateY: 100
        },
        ease: 'ease-in'
      })
      .animator({
        duration: 350,
        properties: {
          translateX: 0,
          translateY: 100
        },
        ease: 'ease-in'
      })
      .animator({
        duration: 350,
        properties: {
          translateX: 0,
          translateY: 0
        },
        ease: 'ease-in'
      })

      const dom3 = document.querySelector('#app #ball3') as HTMLElement
      this.anime3 = new AgileAnime({target: dom3, loop: true})
      this.anime3
      .animator({
        duration: 1000,
        properties: {
          scale: 1,
          translateX: 0,
          translateY: 0
        },
        ease: 'linear'
      })
      .animator({
        duration: 1000,
        properties: {
          scale: 1,
          translateX: 100,
          translateY: 0
        },
        ease: 'linear'
      })
      .animator({
        duration: 1000,
        properties: {
          scale: 2,
          translateX: 100,
          translateY: 0
        },
        ease: 'linear'
      })
      .animator({
        duration: 1000,
        properties: {
          scale: 1,
          translateX: 100,
          translateY: 100
        },
        ease: 'linear'
      })
      .animator({
        duration: 1000,
        properties: {
          scale: 1,
          translateX: 0,
          translateY: 100
        },
        ease: 'linear'
      })
      .animator({
        duration: 1000,
        properties: {
          scale: 1,
          translateX: 0,
          translateY: 0
        },
        ease: 'linear'
      })

      const dom4 = document.querySelector('#app #ball4') as HTMLElement
      this.anime4 = new AgileAnime({target: dom4, loop: true})
      this.anime4
      .animator({
        duration: 350,
        properties: {
          rotate: 0
        },
        ease: 'linear'
      })
      .animator({
        duration: 350,
        properties: {
          rotate: 60
        },
        ease: 'linear'
      })
      .animator({
        duration: 350,
        properties: {
          rotate: -30
        },
        ease: 'linear'
      })
      .animator({
        duration: 1000,
        properties: {
          rotate: 180
        },
        ease: 'elasticEaseOut'
      })
      .animator({
        duration: 350,
        properties: {
          rotate: 0
        },
        ease: 'linear'
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
    margin-top 10px
    background-color #E0EEEE
    box-shadow 2px 2px 5px 2px rgba(0,0,0,0.3)
    border-radius 10px
</style>
