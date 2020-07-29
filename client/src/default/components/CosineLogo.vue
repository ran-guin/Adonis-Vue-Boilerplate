<template lang='pug'>
    svg.logo(:height='height' :width='width')
        defs
            path.sine.wave#wave1(:d='sineWave' x="0" y="0" :stroke="stroke('sine')")
            path.cosine.wave#wave2(:d='cosineWave' x="0" y="0" :stroke="stroke('cosine')")
        
        use(v-if='animate && animateType==="svg"' xlink:href='#wave1')
            animate(attributeName='x' :from="-width/2" :to="width/2" :dur="duration" repeatCount="indefinite")
        use(v-if='animate && animateType==="svg"' xlink:href='#wave2')
            animate(attributeName='x' :from="width/2" :to="-width/2" :dur="duration" repeatCount="indefinite")
        
        path.sine.wave(v-if='!animate || animateType==="math"' :d='sineWave' :stroke="stroke('sine')")
        path.cosine.wave(v-if='!animate || animateType==="math"' :d='cosineWave' :stroke="stroke('cosine')")

        path.axis(:d='xaxis' :stroke="stroke('axis')")
        path.axis(:d='yaxis'  :stroke="stroke('axis')")

        text.text.cosine(:x="text.x1" :y="text.y1" :font-size='height/6' :stroke="stroke('text')" :fill="stroke('text')" :textLength='height*1.5' lengthAdjust="spacingAndGlyphs") C O S I N E
        text.text.systems(:x="text.x2" :y="text.y2" :font-size='height/6' :stroke="stroke('text')" :fill="stroke('text')" :textLength='height*1.5' lengthAdjust="spacingAndGlyphs") S Y S T E M S
</template>

<script>
export default {
    data () {
        return {
            animateType: 'math', // svg: (move along axis) OR math: (calculate ypos & loop requestAnimationFrame) 
            scale: 90,
            offset: -90,
            cycles: 1,
            // wave: {
            //     offset: -90,
            //     amplitude: 100,
            //     wavelength: 200
            // },
            segments: [],
            delay: 0,
            sineWave: '',
            cosineWave: '',
            Colours: {
                light: {
                    axis: 'grey',
                    sine: 'red',
                    cosine: 'blue',
                    text: 'black'
                },
                dark: {
                    axis: 'grey',
                    sine: 'red',
                    cosine: 'blue',
                    text: 'white'
                }
            }
        }
    },
    props: {
        theme: {
            type: String,
            default: 'light'
        },
        height: {
            type: String,
            default: '120'
        },
        animate: {
            type: Boolean
        },
        speed: {
            type: String,
            default: '1' // scale based on 4 second cycle
        }
    },
    methods: {
        animateWave: function () {
            // SVG animation using requestAnimationFrame
            var points = this.segments.map( x => {
                var scale = this.scale / 100 * this.height/2
                var fwdAngle = this.cycles*6.28*(x - this.delay)/ this.width
                var revAngle = this.cycles*6.28*(x + this.delay)/ this.width

                var yoffset = this.height / 2 - 1

                var sine = scale * Math.sin(fwdAngle) + yoffset
                var cosine  = scale * Math.cos(revAngle) + yoffset
                return [x, sine, cosine]
            })

            this.delay = this.delay + 1 * this.speed

            var sinePath = points.map( p => {
                return p[0] + ' ' + p[1]
            }).join(' L ')

            var cosinePath = points.map( p => {
                return p[0] + ' ' + p[2]
            }).join(' L ')

            this.sineWave = 'M' + sinePath
            this.cosineWave = 'M' + cosinePath
            if (this.animate && this.animateType === 'math' && this.speed) { requestAnimationFrame(this.animateWave) }
        },
        stroke: function (item) {
            return this.Colours[this.theme][item]
        }
    },
    computed: {
        width: function () {
            return this.height * 2
        },
        xaxis: function () {
            return 'M0 ' + this.height/2 + ' L ' + this.width + ' ' + this.height/2
        },
        yaxis: function () {
            return 'M' + this.width*0.243 + ' 0 L ' + this.width*0.243 + ' ' + this.height
        },
        duration: function () {
            var seconds = 4 * this.speed
            return seconds + 's'
        },
        text: function () {
            return {
                x1: this.width * 0.06,
                x2: this.width * 0.12,
                y1: this.height / 2 - this.height / 10, // add font height
                y2: this.height / 2 + this.height / 10 + this.height/6
            } 
        },
        sinewave: function () {
            // Static Sine Wave
            var dstring = 'M10 80 Q 77.5 10, 145 80 T 280 80'
            return dstring
        }
    },
    created: function () {
        for (var i = -600; i <= 600; i++) {
            this.segments.push(i)
        }
        this.animateWave()
    }
}
</script>
<style>
/* svg.logo {
    border: 1px solid black;
} */

/* path.sine {
    stroke: red
}
path.cosine {
    stroke: blue
} */
path.wave {
  stroke-width: 1px;
  fill: none;
  stroke-linecap: round;
  /* opacity: 0.5 */
}
path.axis {
    /* stroke: grey; */
    stroke-width: 1px;
    fill: none;
    stroke-linecap: round;
}
.text {
    letter-spacing: 5px;
    font-family: Helvetica;
    stroke-width: 0.5px;
    /* font-stretch: 'ultra-expanded'; */
    /* stretch: 3; */
}
/* .text.cosine {
    font-size: 16px;
}
.text.systems {
    font-size: 16px;
} */
</style>