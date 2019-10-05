<template lang='pug'>
    PageLayout()
        v-container
            v-btn.btn-primary(@click='loadTable') Load Table
            v-text-field(v-model='fieldList')
            v-btn.btn-primary(@click='loadData') Load Data
        hr
        v-container
            v-tabs(model='tab')
                v-tab(href='#tab-0') Data
                v-tab(href='#tab-1') Graph
                v-tab(href='#tab-2') Dump
                hr
                v-tab-item(value='tab-0')
                    v-data-table(v-if='dataset' :headers='showFields' :items='dataset' :items-per-page='20' class='elevation-9')
                v-tab-item(value='tab-1')
                    h3 Graph...:
                v-tab-item(value='tab-2')
                    h3 Dump:
                    h4 Fields: {{JSON.stringify(showFields, null, 2)}}
                    h4 Dataset: {{JSON.stringify(dataset, null, 2)}}
            hr
</template>

<script>
import axios from 'axios'
import config from '@/config'
import PageLayout from '@/layouts/PageLayout'

export default {
    components: {
        PageLayout
    },
    data () {
        return {
            fieldList: 'username, email',
            dataset: [],
            showFields: [],
            apiURL: config.apiURL[process.env.NODE_ENV],
            tableFields: ['Field', 'Type', 'Null', 'Key', 'Default']
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
        loadTable: function () {
            const url = this.apiURL + '/describe?table=users'
            console.log('get data from ' + url)
            const _this = this
            axios.get(url)
                .then(function (response) {
                    console.log('Response: ' + JSON.stringify(response.data))
                    if (response.data) {
                        _this.$set(_this, 'dataset', response.data[0])
                        _this.parseFields(_this.tableFields)
                    }
                })
        },

        loadData: function () {
            const url = this.apiURL + '/getData?table=users'
            console.log('get data from ' + url)
            const _this = this
            axios.get(url)
                .then(function (response) {
                    console.log('Response: ' + JSON.stringify(response.data))
                    if (response.data) {
                        var fields = []
                        if (response.data.data) {
                            _this.$set(_this, 'dataset', response.data.data)
                        }
                        if (response.data.fields) {
                            fields = response.data.fields
                        } else {
                            fields = Object.keys(response.data.data[0])
                        }
                        _this.parseFields(fields)
                    } else {
                        console.error('no data response...')
                    }
                })
        },

        parseFields: function (fields) {
            this.showFields = []
            for (var i = 0; i < fields.length; i++) {
                this.$set(this.showFields, i, { text: fields[i], value: fields[i] })
            }
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
