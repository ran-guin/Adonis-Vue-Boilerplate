<template lang='pug'>
    div
        v-container
            v-tabs
                v-tab Raw Data
                v-tab Graph
                v-tab Dump
            hr
            v-container
                v-btn.btn-primary(@click='loadData') Load Data
            hr
            v-data-table(v-if='dataset' :headers='showFields' :items='dataset' :items-per-page='20' class='elevation-9')
            hr
            h4 Fields: {{JSON.stringify(showFields)}}
            h4 Dataset: {{JSON.stringify(dataset[0])}}
</template>

<script>
import axios from 'axios'
// import config from '@/config'

export default {
    data () {
        return {
            dataset: [],
            showFields: []
        }
    },
    created: function () {
        console.log('Data viewer')
        if (this.data) {
            this.dataset = this.data
            this.showFields = this.fields
        }
    },
    props: {
        data: { type: Array },
        fields: { type: Array }
    },
    methods: {
        loadData: function () {
            const url = 'http://localhost:3333/dump'
            console.log('get data from ' + url)
            const _this = this
            axios.get(url)
                .then(function (response) {
                    console.log('Response: ' + JSON.stringify(response.data))
                    if (response.data) {
                        if (response.data.data) {
                            _this.$set(_this, 'dataset', response.data.data)
                        }
                        if (response.data.fields) {
                            _this.$set(_this, 'showFields', response.data.fields)
                        } else {
                            var fields = Object.keys(response.data.data[0])
                            _this.showFields = []
                            for (var i = 0; i < fields.length; i++) {
                                _this.$set(_this.showFields, i, { text: fields[i], value: fields[i] })
                            }
                        }
                    } else {
                        console.error('no data response...')
                    }
                })
        }
    }
}
</script>
<style scoped>
th {
    background-color: lightyellow;
    color: blue;
}
</style>
