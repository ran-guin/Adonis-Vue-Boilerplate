<template lang='pug'>
    PageLayout()
        v-container(light)
            v-text-field(light v-model='table' style='background-color: white; padding: 0.5rem;' label='Database Table')
            v-text-field(light v-model='condition' style='background-color: white; padding: 0.5rem;' label='Condition')
            div(style='display: inline-block')
                v-btn.btn-primary(v-if='table' @click='loadData') Load Data
        hr
        v-container(dark)
            v-tabs(model='tab' hide-slider)
                v-tab(href='#tab-0') Data
                v-tab(href='#tab-1') Graph
                v-tab(href='#tab-2') Dump
                hr
                v-tab-item(value='tab-0')
                    v-data-table(v-if='dataset && dataset.length' :headers='headers' :items='dataset' :items-per-page='20' class='elevation-9')
                        template(v-slot:top)
                            v-dialog(v-model="dialog" max-width="500px")
                                template(v-slot:activator="{ on }")
                                    v-container
                                        v-btn(color="primary" dark class="mb-2" v-on="on") New Item
                                        br
                                        v-container.showFields(fluid v-if='dataFields')
                                            b Display: &nbsp;
                                            v-checkbox.showField(v-for='fld in dataFields' v-model='pickFields' :label='fld' :value='fld' :key='fld' @change='reRenderTable')
                                v-card
                                    v-card-title Dataset:
                                    v-card-text
                                        v-container
                                            rgv-form(:form='dataForm' :options='formOptions')
                                            hr
                                            h3 {{dataForm}}
                                            //- v-row
                                                //- v-col(cols="12" sm="6" md="4")
                                                    //- v-text-field(v-for='fld in dataFields' v-model="form[fld]" :label="fld" :key='fld')
                                    v-card-actions
                                        div.flex-grow-1
                                            v-btn(color="blue darken-1" text @click="close") Cancel
                                            v-btn(color="blue darken-1" text @click="save") Save
                        template(v-slot:item.action="{ item }")
                            v-icon.mr-2(small @click='editItem(item)') edit
                            v-icon.mr-2(small @click='deleteItem(item)') delete
                        template(v-slot:no-data)
                            v-btn(color='primary' @click='initialize') Reset
                    //- div(v-else)
                    //-     p No data
                v-tab-item(value='tab-1')
                    h3 Graph...:
                    h4 Form {{JSON.stringify(dataForm, null, 2)}}
                v-tab-item(value='tab-2')
                    h3 Dump:
                    h4 Fields: {{JSON.stringify(dataFields, null, 2)}}
                    h4 Headers: {{JSON.stringify(headers, null, 2)}}
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
            table: 'users',
            condition: '',
            dataFields: [],
            fieldInfo: {},
            headers: [],
            pickFields: [],
            apiURL: config.apiURL[process.env.NODE_ENV],
            tableFields: ['Field', 'Type', 'Null', 'Key', 'Default'],
            crud: true,
            editedIndex: -1,
            form: {},
            dialog: false,
            formOptions: { fields: [] },
            dataForm: {}
        }
    },
    created: function () {
        console.log('Data viewer')
        if (this.data) {
            this.dataset = this.data
            this.dataFields = this.fields
        }
    },
    props: {
        data: { type: Array },
        fields: { type: Array }
    },
    methods: {
        initialize: function () {
            this.dataset = []
            this.tableFields = []
            this.pickFields = []
            this.dataFields = []
            this.headers = []
        },
        async loadTable () {
            const url = this.apiURL + '/tables/' + this.table
            console.log('desc table from ' + url)
            const _this = this
            return axios.get(url)
                .then(function (response) {
                    console.log('Response: ' + JSON.stringify(response.data))
                    if (response.data) {
                        _this.$set(_this, 'tableFields', response.data[0])
                        _this.parseFields(response.data[0])
                    }
                    return _this.tableFields
                })
        },
        async loadData () {
            var url = this.apiURL + '/dataset/' + this.table
            await this.loadTable()
            if (this.condition) { url = url + '?condition=' + this.condition }

            console.log('get data from ' + url)
            const _this = this
            axios.get(url)
                .then(function (response) {
                    console.log('Response: ' + JSON.stringify(response.data))
                    if (response.data) {
                        var fields = []
                        if (response.data.data) {
                            _this.$set(_this, 'dataset', response.data.data)
                            if (response.data.fields) {
                                fields = response.data.fields
                            } else {
                                fields = Object.keys(response.data.data[0])
                            }
                            _this.parseData(fields)
                        } else {
                            console.debug('no response data')
                        }
                    } else {
                        console.error('no data response...')
                    }
                })
        },
        async parseFields (fields) {
            this.fieldInfo = {}
            this.formFields = []
            for (var i = 0; i < fields.length; i++) {
                var fld = fields[i].Field
                this.$set(this.fieldInfo, fld, fields[i])
                var type = fields[i].Type
                this.formOptions.fields.push({name: fld, type: type})
            }
            console.debug('field Info: ' + JSON.stringify(this.fieldInfo))
            console.debug('form Options: ' + JSON.stringify(this.formOptions))
        },
        parseData: function (fields) {
            this.dataFields = []
            this.headers = []
            for (var i = 0; i < fields.length; i++) {
                this.$set(this.headers, i, { text: fields[i], value: fields[i] })
                this.dataFields.push(fields[i])
            }
            if (this.crud && fields.length) {
                this.headers.push({ text: 'Actions', value: 'action', sortable: false })
            }
            this.pickFields = this.dataFields
        },

        reRenderTable: function () {
            this.headers = []
            var fields = this.pickFields;
            for (var i = 0; i < fields.length; i++) {
                this.$set(this.headers, i, { text: fields[i], value: fields[i] })
            }

            if (this.crud && fields.length) {
                this.headers.push({ text: 'Actions', value: 'action', sortable: false })
            }

        },
        editItem (item) {
            this.editedIndex = this.dataset.indexOf(item)
            console.log('edit item ' + this.editedIndex)
            console.log(JSON.stringify(this.dataset[this.editedIndex]))

            for (var i = 0; i < this.dataFields.length; i++) {
                var fld = this.dataFields[i]
                this.$set(this.dataForm, fld, this.dataset[this.editedIndex][fld])
            }
            console.log('Form: ' + JSON.stringify(this.dataForm))
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deleteItem (item) {
            const index = this.dataset.indexOf(item)
            console.log('Delete: ' + JSON.stringify(this.dataset[index]))
            confirm('Are you sure you want to delete this item?') && this.dataset.splice(index, 1)
        },

        close () {
            this.dialog = false

            const keys = Object.keys(this.dataForm)
            for (var i = 0; i < keys.length; i++) {
                this.$set(this.dataForm, keys[i], '')
            }
            // this.$set(this, 'dataForm', {})
            setTimeout(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            }, 300)
        },

        save () {
            if (this.editedIndex > -1) {
                Object.assign(this.dataset[this.editedIndex], this.editedItem)
            } else {
                this.dataset.push(this.editedItem)
            }
            this.close()
        }
    }
}
</script>
<style scoped>
th {
    background-color: lightyellow;
    color: blue;
}

.showFields {
    display: flex;
    justify-content: spae-between
}
</style>
