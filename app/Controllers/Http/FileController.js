'use strict'
const { validate } = use('Validator')
const Validator = use('Validator')
const Database = use('Database')
const Env = use('Env')

const Helpers = use('Helpers')

const fs = require('fs')

const sharp = require('sharp')
const { toNamespacedPath } = require('path')
// const formidable = require('formidable')

const public_directories = [
    'custom/images/',
    'custom/images/events/',
    'custom/images/large/',
    'custom/images/small/',
    'custom/images/users/',
]

class FileController {

    async files ({request, response}) {
        const {dir} = request.all()
        
        if (dir === 'undefined') { dir = '' }

        const directory = dir || 'custom/images/'
        const path = './public/'

        console.log('get files from ' + path + directory)
        if (public_directories.indexOf(directory) >= 0) {
            console.log(directory + ' access permitted...')
            var Found = {}

            var ext = []
            var Files = fs.readdirSync(path + directory, (err, files) => {
                console.log('....')
                if (err) {
                    console.log('err: ' + err.message)
                    throw err
                    response.json({message: 'Error'})
                }
                console.log(files.length + ' Files found...')
                
            });

            Files.forEach(file => {
                var fname = file.split('.')
                console.log(JSON.stringify(fname))
                if (fname[0] && fname.length === 2) {
                    if (Found[fname[0]]) { Found[fname[0]].push(fname[1]) }
                    else { Found[fname[0]] = [fname[1]] }
                }
            });

            console.log('found ' + Files.length)
            console.log(JSON.stringify(Found))
            response.json(Object.keys(Found))

        } else {
            console.log(directory + ' access NOT permitted...')
            response.json({message: directory + ' not accessible'})
        }
    }

    async upload ({request, response, params}) {
        const input = request.all() || {}
        console.log('upload file...')
        const F = request.file('file', {
            types: ['image'],
            extnames: ['png', 'gif', 'jpg', 'jpeg']
        })
        if (F) {
            console.log("Uploaded File: " + F.filename)

            await F.move(Helpers.tmpPath('uploads'), {overwrite: true})            
            
            input.tmpPath = './tmp/uploads/'
            input.ext = F.extname
            input.name = F.fileName
            input.status = F.status
            input.dir = './client/src/assets/custom/images/events/'
            input.alt = 'jpeg'
            
            console.debug('input: ' + JSON.stringify(input))
            var ext = '.' + F.extname
            var altFile = input.name.replace(ext, '.jpeg')

            console.log('compress images ' + altFile)

            this.getMetadata(input)

            response.json({message: 'Thanks !', filename: input.name, altFile: altFile})
        
        } else {
            console.log('no file found')
            response.json({message: 'no file found'})
        }
    }

    getMetadata (input) {
        const {name, alt, tmpPath, ext, dir, height, width, format, status} = input

        const tmpFile = tmpPath + name

        console.log("Input: " + JSON.stringify(input))
        var target
        if (dir) {
            target = dir + name.replace('.' + ext, '')
        } else {
            target = tmpPath + name.replace('.' + ext, '')
        }

        var newFormat = format || 'webp'
            
        const Img = sharp(tmpFile)
        Img.metadata()
            .then ( metadata => {
                console.log("Image Size: " + metadata.height + ' x ' + metadata.width)

                const max_width = width || 780
                const max_height = height || 780
                
                console.debug('check image dimensions...')

                try {
                    var resize = {}
                    if ((metadata.width > metadata.height) && metadata.width > max_width) {
                        console.debug('reduce width')
                        target = target + '-opt-' + max_width
                        target = target + '.' + newFormat

                        console.log('write to ' + target + '.' + newFormat)
                        resize = { width: max_width}
                    } else if (metadata.height > max_height) {
                        console.debug('reduce height')
                        resize = { height: max_height }
                    }

                    target = target + '-opt-' + max_width
                    Img
                        .clone()
                        .resize(resize)
                        .webp({ quality: 80 })
                        .toFile(target + '.' + newFormat)
                        
                    if (alt && alt === 'jpeg') {
                        Img
                            .clone()
                            .resize({ width: max_width })
                            .jpeg({ quality: 80 })
                            .toFile(target + '.' + alt)
                    }
                    console.log('saved ' + target)
                    return Promise.resolve({message: 'compressed'})                
                } catch (err) {
                    console.log("error resizing")
                    return Promise.reject({message: 'error resizing'})                
                }
            })
            .catch (err => {
                console.debug("Error generating metadata for image " + err.message)
                return Promise.reject({error: 'Error1'})
            })
    }

}
module.exports = FileController
