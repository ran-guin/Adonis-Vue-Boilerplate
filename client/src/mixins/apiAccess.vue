 <!--

Usage example.


 -->

<script>
import Config from '@/config.js'
import axios from 'axios'

export default {
    data () {
        return {
            apiURL: Config.apiURL[process.env.NODE_ENV],
            debug: Config.DEBUG_MODE,
            apiResponse: null,
            apiResponseError: ''
        }
    },
    mounted: function () {
    
    },
    created: function () {
        console.log("Including DataLoader mixin...")
    },
    computed: {
        payload: function () {
            return this.$store.getters.payload || {}
        },
        access: function () {
            if (this.payload && this.payload.access) {
                return this.payload.access
            } else {
                return 'Public'
            }
        }
    },
    methods: {
        loadLookup (table, reference) {
            var url = this.apiURL + '/lookup/' + table
            var lookup = this.formLookup || {}
            console.log('url: ' + url)
            var _this = this
            return axios.get(url)
                .then(function (response) {
                    lookup[reference] = response.data
                    _this.formLookup = lookup
                    return Promise.resolve(lookup)
                })
                .catch(function (err) {
                    console.log("Error retrieving lookup: " + err.message)
                    return Promise.reject(err.message)
                })
        },
        apiCall (path, attribute) {
            var url = this.apiURL + path
            console.log('url: ' + url)
            this.apiResponse = null
            this.apiResponseError = ''
            var _this = this
            console.log('url: ' + url)
            return axios.get(url)
                .then(function (response) {
                    console.log('got response: ' + JSON.stringify(response))
                    var returnval = null
                    if (response && response.data) {
                        if (attribute) {
                            if (response.data[attribute]) {
                                returnval = response.data[attribute]
                            } else {
                                _this.apiResponseError = 'no ' + attribute + ' attribute in response'
                            }
                        } else {
                            returnval = response.data
                        }
                        _this.apiResponse = returnval
                        return Promise.resolve(returnval)
                    } else {
                        console.log('invalid response ?')
                        return Promise.reject('invalid response')
                    }
                })
                .catch(function (err) {
                    console.log('Error with api call: ' + url)
                    console.log(err.message)
                    _this.apiResponseError = 'apiCall error: ' + err.message
                    return Promise.reject(err.message)
                })           
        }
    }
}
</script>