'use strict'
/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/

const Route = use('Route')
const Helpers = use('Helpers')
const Logger = use('Logger')
const Config = use('Config')
const Database = use('Database')

const custom_routes = require('./custom/routes.js')

console.log('load routes..')

// Public SSR pages
Route.get('/', 'PublicController.home')
Route.get('/test', 'PublicController.test')

Route.get('login', 'PublicController.login')
Route.get('register', 'PublicController.register')
Route.get('recover', 'PublicController.recoverPassword')
Route.get('construction', 'PublicController.construction')
Route.get('/about', 'PublicController.about')
Route.get('/public', 'PublicController.public')
Route.get('/contact', 'PublicController.contact')

Route.post('/login', 'AuthController.login')
Route.post('logout', 'AuthController.logout')
Route.post('register', 'AuthController.register')

Route.get('/check', 'AuthController.check')

// Auth access
Route.get('/env', 'AuthController.env')
Route.get('/accessResetPassword', 'AuthController.accessResetPassword')
Route.get('/resendWelcome', 'AuthController.resendWelcome')

Route.post('/recoverPassword', 'AuthController.recoverPassword')
Route.post('/resetPassword', 'AuthController.resetPassword')
Route.post('/confirmRegistration', 'AuthController.confirmRegistration')

Route.post('/message/outgoing', 'PublicController.sendMessage')
Route.post('/message/incoming', 'PublicController.receiveMessage')

Route.get('/docs', 'HelpController.viewDoc')

// Public Routes:

// Generic routes
Route.get('/loadTable', 'DBFormController.loadTable')
Route.get('/loadTable/:table', 'DBFormController.loadTable')
Route.post('/saveForm', 'DBFormController.saveRecord')

// Generic routes
Route.get('/tables', 'GenericController.tables')
Route.get('/tables/:table', 'GenericController.describe')
Route.get('/dataset/:table', 'GenericController.search')
Route.post('/dataset/:table', 'GenericController.append')
Route.put('/dataset/:table/:id', 'GenericController.update')
Route.delete('/dataset/:table/:id', 'GenericController.delete')

Route.get('/config', 'GenericController.config')
Route.get('/lookup/:table', 'GenericController.lookup')

Route.get('/users/:user_id/contacts', 'ContactController.find')
Route.get('/users/:user_id/settings', 'ContactController.settings')