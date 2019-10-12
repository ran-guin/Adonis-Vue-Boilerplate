<template lang='pug'>
    svg.logo(:height='height' :width='width')
        defs
            path.sine.wave#wave1(:d='sineWave')
            path.cosine.wave#wave2(:d='cosineWave')
        use(xlink:href='#wave1' x="0" y="0")
            animate(attributeName='x' :from="-width/2" :to="width/2" dur="5s" repeatCount="indefinite")
        use(xlink:href='#wave2' x="0" y="0")
            animate(attributeName='x' :from="width/2" :to="-width/2" dur="5s" repeatCount="indefinite")
        //- path.sine.wave(:d='sineWave')
        //- path.cosine.wave(:d='cosineWave')
        path.axis(:d='xaxis')
        path.axis(:d='yaxis')
        text.text.cosine(:x="text.x1" :y="text.y1") C O S I N E
        text.text.systems(:x="text.x2" :y="text.y2") S Y S T E M S
</template>

<script>
export default {
    data () {
        return {
            scale: 90,
            height: 120,
            width: 250,
            offset: -90,
            cycles: 1,
            wave: {
                offset: -90,
                amplitude: 100,
                wavelength: 200
            },
            segments: [],
            delay: 0,
            sineWave: '',
            cosineWave: ''
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

            this.delay++

            var sinePath = points.map( p => {
                return p[0] + ' ' + p[1]
            }).join(' L ')

            var cosinePath = points.map( p => {
                return p[0] + ' ' + p[2]
            }).join(' L ')

            this.sineWave = 'M' + sinePath
            this.cosineWave = 'M' + cosinePath
            // requestAnimationFrame(this.animateWave)
        }
    },
    computed: {
        xaxis: function () {
            return 'M0 ' + this.height/2 + ' L ' + this.width + ' ' + this.height/2
        },
        yaxis: function () {
            return 'M' + this.width*0.2 + ' 0 L ' + this.width*0.2 + ' ' + this.height
        },
        text: function () {
            return {
                x1: this.width * 0.1,
                x2: this.width * 0.3,
                y1: this.height / 2 - this.height / 5 + 14, // add font height
                y2: this.height / 2 + this.height / 5
            } 
        },
        sinewave: function () {
            // Static Sine Wave
            var dstring = 'M10 80 Q 77.5 10, 145 80 T 280 80'
            return dstring
        },
        buildWave: function () {
            // Generate Bezier curve wave (NOT USED)
            var amp = this.wave.amplitude * this.scale / 100
            var m = 0.512286623256592433;
            var ypos = this.height / 2
            var xpos = this.wave.offset || 0
            
            var pathData = [
                'M', xpos, ypos + (amp / 2) - 1 , 
                'c',  amp * m, 0,
                amp * (1 - m), -amp, 
                amp, -amp,
                's', amp * (1 - m), amp,
                amp, amp,
                's', amp * (1 - m), -amp,
                amp, -amp,
                's', amp * (1 - m), amp,
                amp, amp,
                's', amp * (1 - m), -amp,
                amp, -amp,
                's', amp * (1 - m), amp,
                amp, amp,
                's', amp * (1 - m), -amp,
                amp, -amp
            ].join(' ');

            return pathData
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

path.sine {
    stroke: red
}
path.cosine {
    stroke: blue
}
path.wave {
  stroke-width: 5px;
  fill: none;
  stroke-linecap: round;
  opacity: 0.2
}
path.axis {
    stroke: grey;
    stroke-width: 1px;
    fill: none;
    stroke-linecap: round;
}
.text {
    letter-spacing: 5px;
    font-family: Helvetica;
}
</style>