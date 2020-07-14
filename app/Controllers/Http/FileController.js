'use strict'
const { validate } = use('Validator')
const Validator = use('Validator')
const Database = use('Database')
const Env = use('Env')

const Helpers = use('Helpers')

const fs = require('fs')

const sharp = require('sharp')
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
        console.log('get files from ' + dir)
        
        const directory = dir || 'custom/images/'
        const path = './public/'

        if (public_directories.indexOf(directory) >= 0) {
            console.log(directory + ' access permitted...')

            var found = []
            var Files = fs.readdirSync(path + directory, (err, files) => {
                if (err) {
                    throw err
                    response.json({message: 'Error'})
                }
                console.log(files.length + ' Files found...')
                found = files
                console.log('Found ' + found)
                // response.json({message: 'Found', count: found.length})
                // files object contains all files names
                // log them on console
                // files.forEach(file => {
                //     console.log(file);
                // });
            });
            console.log('found ' + Files.length)
            response.json(Files)

        } else {
            response.json({message: directory + ' not accessible'})
        }
    }

    async upload ({request, response, params}) {
        const input = request.all() || {}

        const F = request.file('file', {
            types: ['image'],
            extnames: ['png', 'gif', 'jpg', 'jpeg']
        })
        if (F) {
            console.log("Uploaded File...")

            await F.move(Helpers.tmpPath('uploads'), {overwrite: true})            
            
            console.log('update input')
            
            input.tmpPath = './tmp/uploads/'
            input.ext = F.extname
            input.name = F.fileName
            input.status = F.status
            input.dir = './client/src/assets/custom/images/events/'

            console.log('compress images')

            await this.getMetadata(input)
                .then (meta => {
                    console.log('Meta: ' + JSON.stringify(meta))
                })
                .catch (err => {
                    console.debug('Meta Err: ' + err.message)
                })

            response.json({message: 'Thanks !'})
        
        } else {
            console.log('no file found')
            response.json({message: 'no file found'})
        }
    }

    async getMetadata (input) {
        const {name, tmpPath, ext, dir, height, width, format, status} = input

        const tmpFile = tmpPath + name

        console.log("Input: " + JSON.stringify(input))
        var target
        if (dir) {
            target = dir + name.replace('.' + ext, '')
        } else {
            target = tmpPath + name.replace('.' + ext, '')
        }

        var newFormat = format || 'webp'
            
        console.log('check ' + tmpFile)
        const Img = sharp(tmpFile)
        Img.metadata()
            .then ( metadata => {
                // console.log('metadata extracted...' + JSON.stringify(metadata))
                console.log("Image Size: " + metadata.height + ' x ' + metadata.width)

                const max_width = width || 780
                const max_height = height || 780
                
                console.debug('check image dimensions...')

                if ((metadata.width > metadata.height) && metadata.width > max_width) {
                    console.debug('reduce width')
                    target = target + '.opt-' + max_width
                    target = target + '.' + newFormat

                    console.log('write to ' + target)

                    Img
                        .clone()
                        .resize({ width: max_width })
                        .webp({ quality: 80 })
                        .toFile(target)
                    
                    console.log('compressed...')
                } else if (metadata.height > max_height) {
                    console.debug('reduce height')
                    target = target + '.opt-' + max_width
                    target = target + '.' + newFormat
                    console.log('write to ' + target)
                    Img
                        .clone()
                        // .resize({ width: max_width })
                        .resize({ height: max_height })
                        .webp({ quality: 80 })
                        .toFile(target)
                    
                    console.log('compressed...')
                } else if (ext !== 'webp') {
                    console.debug('image is small enough already')
                    target = target + '.' + newFormat
                    console.log('write to ' + target)
                    Img
                        .clone()
                        .webp({ quality: 80 })
                        .toFile(target)
                    
                    console.log('compressed...')
                }
                return Promise.resolve({message: 'compressed'})
            })
            .catch (err => {
                console.debug("Error generating metadata for image " + err.message)
                return Promise.reject({error: 'Error1'})
            })
		// } catch (err) {
		// 	console.debug("Error trying to generating metadata for image " + err.message)
        //     return Promise.reject(new Error('Error2'))
		// }
    }

}
module.exports = FileController
