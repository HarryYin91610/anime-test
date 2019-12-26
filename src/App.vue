<template lang="pug">
div#app
  div.ball-1(id="ball1", @click="playBall(1)")
  
  div.ball-2(id="ball2", @click="playBall(2)")

  div.ball-2(id="ball3", @click="playBall(3)")

  div.ball-2(id="ball4", @click="playBall(4)")

  div.ball-2(id="ball5", @click="playBall(5)")

  div.ball-2(id="ball6", @click="playBall(6)")

  div.ball-2(id="ball7", @click="playBall(7)")

  div.ball-2(id="ball8", @click="playBall(8)")

  div.ball-2(id="ball9", @click="playBall(9)")

  div.ball-2(id="ball10", @click="playBall(10)")
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
  anime5: AgileAnime | null = null
  anime6: AgileAnime | null = null
  anime7: AgileAnime | null = null
  anime8: AgileAnime | null = null
  anime9: AgileAnime | null = null
  anime10: AgileAnime | null = null

  playBall (index: number) {
    const self: any = this
    const anime = self['anime' + index]
    if (anime.playing) {
      console.log('动画正在进行中...')
      return
    }
    anime && anime.play()
  }

  mounted () {
    this.$nextTick(() => {
      const dom = document.querySelector('#app #ball1') as HTMLElement
      this.anime1 = new AgileAnime(dom, true)
      this.anime1
      .animator(1000, {
        translateX: 300
      }, 'ease-in')
      .animator(1500, {
        translateY: 500
      }, 'linear')
      .animator(2000, {
        translateX: 0,
        translateY: 0
      }, 'ease-in-out')
      .animator(1000, {
        translateX: 300,
        translateY: 100
      }, 'ease-out')
      .animator(1000, {
        translateX: 400,
        translateY: 400
      }, 'elasticEaseOut')
      .animator(1000, {
        translateX: 500,
        translateY: 600
      }, 'cubic-bezier(1.00, 0.47, 0.51, -0.05)')
      .animator(1500, {
        translateX: 0,
        translateY: 0
      }, 'linear')

      const dom2 = document.querySelector('#app #ball2') as HTMLElement
      this.anime2 = new AgileAnime(dom2)
      this.anime2
      .animator(1000, {
        translateY: 300
      }, 'elasticEaseInOut')
      .animator(1000, {
        translateX: 500,
        translateY: 600
      }, 'cubic-bezier(1.00, 0.47, 0.51, -0.05)')
      .animator(1000, {
        translateX: 0,
        translateY: 0
      }, 'elasticEaseOut')

      const dom3 = document.querySelector('#app #ball3') as HTMLElement
      this.anime3 = new AgileAnime(dom3)
      this.anime3
      .animator(1000, {
        translateY: 300
      }, 'elasticEaseOut')
      .animator(1000, {
        translateX: 200,
        translateY: 400
      }, 'elasticEaseIn')
      .animator(1000, {
        translateX: 0,
        translateY: 0
      }, 'elasticEaseInOut')

      const dom4 = document.querySelector('#app #ball4') as HTMLElement
      this.anime4 = new AgileAnime(dom4)
      this.anime4
      .animator(1000, {
        translateY: 300
      }, 'elasticEaseIn')
      .animator(1000, {
        translateX: 0,
        translateY: 0
      }, 'bounceEaseOut')

      const dom5 = document.querySelector('#app #ball5') as HTMLElement
      this.anime5 = new AgileAnime(dom5, true)
      this.anime5
      .animator(2000, {
        translateY: 300
      }, 'bounceEaseIn')
      .animator(1000, {
        translateX: 0,
        translateY: 0
      }, 'elasticEaseIn')

      const dom6 = document.querySelector('#app #ball6') as HTMLElement
      this.anime6 = new AgileAnime(dom6, true)
      this.anime6
      .animator(2000, {
        translateY: 300
      }, 'bounceEaseOut')
      .animator(1000, {
        translateX: 0,
        translateY: 0
      }, 'backEaseOut')

      const dom7 = document.querySelector('#app #ball7') as HTMLElement
      this.anime7 = new AgileAnime(dom7, true)
      this.anime7
      .animator(2000, {
        translateY: 300
      }, 'bounceEaseInOut')
      .animator(1000, {
        translateX: 100,
        translateY: 100
      }, 'elasticEaseOut')
      .animator(1000, {
        translateX: 0,
        translateY: 0
      }, 'bounceEaseOut')

      const dom8 = document.querySelector('#app #ball8') as HTMLElement
      this.anime8 = new AgileAnime(dom8, true)
      this.anime8
      .animator(2000, {
        translateY: 300
      }, 'backEaseIn')
      .animator(1000, {
        translateX: 0,
        translateY: 0
      }, 'backEaseOut')

      const dom9 = document.querySelector('#app #ball9') as HTMLElement
      this.anime9 = new AgileAnime(dom9, true)
      this.anime9
      .animator(2000, {
        translateY: 300
      }, 'backEaseOut')
      .animator(1000, {
        translateX: 0,
        translateY: 0
      }, 'backEaseOut')

      const dom10 = document.querySelector('#app #ball10') as HTMLElement
      this.anime10 = new AgileAnime(dom10, true)
      this.anime10
      .animator(2000, {
        translateY: 300
      }, 'backEaseInOut')
      .animator(1000, {
        translateX: 0,
        translateY: 0
      }, 'backEaseOut')
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
    float left
    width 20px
    height 20px
    margin-right 30px
    background-color red
    border-radius 50%
    &:first-child
      margin-left 40px
    &:last-child
      margin-right 0
  .ball-1
    background-color red
  .ball-2
    background-color blue

</style>
