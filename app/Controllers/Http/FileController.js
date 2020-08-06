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
    'custom/images/originals/',
    'custom/images/large/',
    'custom/images/medium/',
    'custom/images/small/',
    'custom/images/xs/',
    'custom/images/users/',
    'custom/images/events/',
    'default/images/',
    'tmp/uploads/',
    'tmp/resized/'
]

const Sizes = {
    xs: { width: 128 },
    small: { width: 512 },
    medium: { width: 780 },
    large: { width: 1024 },
    xl: { width: 2048 }
}

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
                var fname = file.match(/^(.+)\.(svg|gif|png|webp|jpg|jpeg)$/)
                console.log(JSON.stringify(fname))
                if (fname && fname.length) {
                    var name = fname[1]
                    var type = fname[2]
                    var f = fname[0]
                    if (!Found[name]) { Found[name] = {} }

                    Found[name][type] = f
                }
            });

            console.log('found ' + Files.length)
            console.log(JSON.stringify(Found))
            response.json(Found)

        } else {
            console.log(directory + ' access NOT permitted...')
            response.json({message: directory + ' not accessible'})
        }
    }

    async upload ({request, response, params}) {
        const input = request.all() || {}
        const {name, format, status, size, quality, width, height} = input

        console.log('upload file...' + JSON.stringify(input))

        const multipleFiles = request.files()

        const singleFile = request.file('file', {
            types: ['image'],
            extnames: ['png', 'gif', 'jpg', 'jpeg']
        })

        var files = []
        if (multipleFiles) {
            files = multipleFiles.files || []
            console.log('found files ' + files.length)
        }
        if (singleFile && !files.length) {
            files.push(singleFile)
            console.log('found file')
        }

        var uploaded = []
        var resized = []
        for (var i =0; i < files.length; i++) {
            const F = files[i]
            // Save file to uploads directory
            await F.move(Helpers.tmpPath('uploads'), {overwrite: true})            
            
            console.log("Uploaded file: " + F.fileName)

            // **** Resize ****
            var max_width
            var max_height
            var ext = []
            if (height || width) { 
                max_width = width || height
                max_height = height || width
            } else if (size) {
                max_width = Sizes[size].width || 768
                max_height = Sizes[size].height || Sizes[size].width
            } else {
                max_width = 768
                max_height = 768
            }
 
            if (format) {
                ext = [format] 
            } else {
                ext = ['webp', 'jpeg'] // default to most compressed standards
            }

            var clientDir = 'tmp/resized/'
            var target_name = F.fileName.replace('.' + F.extname, '') + '-opt-' + max_width + '-Q' + quality
            var target = './public/' + clientDir + target_name
            
            const specs = {
                input: './tmp/uploads/' + F.fileName,
                output: target,
                ext: ext,
                quality: quality,
                max_width: max_width,
                max_height: max_height,
                size: size,
            }
            console.log("Uploaded File3: " + F.fileName)
            console.log('resize: ' + JSON.stringify(specs))

            var saved = await this.resize(specs)
            console.log('saved: ' + JSON.stringify(saved))

            uploaded.push(specs.input)
            resized.push(target_name + '.jpeg')
        }
        if (files.length) {
            response.json({message: 'Thanks ! ', uploaded: uploaded, resized: resized, ext: ext})
        } else {
            console.log('no file found')
            response.json({message: 'no file found'})
        }
    }

    resize (specs) {
        const {input, output, ext, max_width, max_height, quality} = specs
        return new Promise((resolve, reject) => {
            const Img = sharp(input)
            Img.metadata()
                .then (metadata => {
                    console.log("Image Size: " + metadata.height + ' x ' + metadata.width)

                    var resize = {}
                    if ((metadata.width > metadata.height) && metadata.width > max_width) {
                        console.debug('reduce width')
        
                        console.log('write to ' + output + '.' + ext)
                        resize = { width: max_width}
                    } else if (metadata.height > max_height) {
                        console.debug('reduce height')
                        resize = { height: max_height }
                    }
        
                    var webp = ext.indexOf('webp')
                    var jpeg = ext.indexOf('jpeg')

                    var saved = []
                    if (webp >=0) {
                        Img
                            .clone()
                            .resize(resize)
                            .webp({ quality: parseInt(quality)})
                            .toFile(output + '.' + ext[webp])
                        console.log('saved ' + output + '.webp')
                        saved.push(output + '.webp')
                    }
                    if (jpeg >=0) {
                        Img
                            .clone()
                            .resize({ width: max_width })
                            .jpeg({ quality: parseInt(quality) })
                            .toFile(output + '.' + ext[jpeg])
                        console.log('saved ' + output + '.jpeg')
                        saved.push(output + '.jpeg')
                    }
                    resolve(saved)
                })
                .catch (err => {
                    console.debug("Error generating metadata for image " + err.message)
                    // return err.message
                    resolve(err)
                })
        })
    }

}
module.exports = FileController
