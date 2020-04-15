import axios from 'axios'
import Config from '@/config.js'

const apiURL = Config.apiURL[process.env.NODE_ENV]
export default {
    async lookup (table, reference) {
        if (!reference) { reference = table.replace(/s$/, '_id') }
        // var keys = Object.keys(form)
        // var subforms
        // if (keys && keys[0].constructor === Object) {
        //     subforms = keys
        // }

        var url = apiURL + '/lookup/' + table
        try {
            const lookup = await axios.get(url)
            if (lookup && lookup.data) {
                // if (subforms) {
                //     for (var i = 0; i < subforms.length; i++) {
                //         if (!form[subform].options.lookup) { form[subform].options.lookup = {} }
                //         const subform = subforms[i]
                //         form[subform].lookup[reference] = lookup.data
                //     }
                //     return new Promise( (resolve, reject) => {
                //         resolve({form: form, message: 'retrieved subform'})
                //         reject({form: form, message: 'rejected subform'})
                //         // resolve(form)
                //     })
                // } else {
                // if (!form.options.lookup) { form.options.lookup = {} }
                // form.options.lookup[reference] = lookup.data
                for (var i = 0; i < lookup.data.length; i++) {
                    if (!lookup.data[i].text) {
                        lookup.data[i].text = lookup.data[i].name
                    }
                }
                return new Promise( resolve => {
                    resolve(lookup.data)
                })
                // }
            } else {
                return new Promise( (resolve) => {
                    this.$myConsole.log('no lookup data')
                    resolve([])
                })
            }
        } catch (err) {
            return new Promise( (resolve) => {
                this.$myConsole.warning('caught error: ' + err)
                resolve([])
            })
        }
    },

    async recursiveList(api) {
        try {
            const list = await axios.get(api)
            
            return new Promise( (resolve) => {
                resolve(list)
            })
        } catch (err) {
            return new Promise( (resolve) => {
                resolve({success: false, scope: 'recursiveList', message: err.message})
            })
        }
    }

}