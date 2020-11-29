'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const Database = use('Database')

class Group extends Model {

    async list (options) {
        const user_id = options.user_id
        const name = options.name
        const type = options.type

        var groups = Database
            .select(
                'name',
                'user_id',
                'id',
                'type'
            )
            .from('groups')
            .where('user_id', user_id)
        
        if (name) {
            groups = groups
                .where('name', name)
        }
        if (type) {
            groups = groups
                .where('type', type)
        }
        const found = await groups
        if (!found) { found = [] }
        return Promise.resolve(found)
    }

}

module.exports = Group
