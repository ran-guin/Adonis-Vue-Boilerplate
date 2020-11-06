'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Group extends Model {

    async list (user_id) {
        var groups = await Database
            .select(
                'name',
                'id',
                'type'
            )
            .from('groups')
            .where('user_id', user_id)

        return groups
    }

    async create (user_id, name, options) {

        if (!options) { options = {} }
        var type = options.type || 'Private'
        var initialize = options.initialize || false

        var newGroup
        if (user_id && name) {
            newGroup = await Database
                .select(
                    'id',
                    'name'
                )
                .from('groups')
                .where(user_id, 'like', user_id)
                .where(name, 'like', name)
            
            if (!newGroup) {
                console.log('create group: ' + name)

                newGroup = await new Group()
                newGroup.user_id = user_id
                newGroup.name = name
                newGroup.type = type
            
                newG = await newGroup.save()
            }
        } 
        return newGroup
    }
}

module.exports = Group
