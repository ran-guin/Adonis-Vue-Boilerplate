'use strict'
const Database = use('Database')
const Datum = use('App/Models/Datum')

class DatumController {
    async dump ({request, response}) {
        const {fields, table, condition, limit} = request.all()

        var field_list = fields.split(/, ?/)
        var results = Database
            .select(field_list)
            .from(table)

        if (condition) {
        results = results
            .whereRaw(condition)
        }
        if (limit) {
            results = results
                .limit(limit)
        }
               
        const found = await results
        response.json({data: found, fields: field_list})
    }

    async dataview ({request, response, view}) {
        var results = await Database
            .select([
                'violation_id',
                'violation_date'
            ])
            .from('dataset')
        if (results) {
            var fields = Object.keys(results[0])
            console.log('Fields: ' + JSON.stringify(fields))
            console.log('Dataset: ' + JSON.stringify(results, null, 2))
            return view.render('dataview', {dataset: results, fields: fields, message: results.length + ' Records'})
        } else {
            return view.render('dataview')
        }
    }

    async vuetify ({request, response, view}) {
        console.log('redirect to data viewer..')
        response.redirect('/#/data')
    }
}

module.exports = DatumController
