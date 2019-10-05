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

// SSR pages
Route.get('/', 'PublicController.test')
Route.get('/test', 'PublicController.test')

Route.get('', 'PublicController.landingPage')
Route.get('/', 'PublicController.landingPage')

Route.get('web', 'PublicController.landingPage')
Route.get('/web/:target', 'PublicController.landingPage')
Route.get('public', 'PublicController.landingPage')
Route.get('public/:target', 'PublicController.landingPage')

Route.get('public', 'PublicController.landingPage')
Route.get('public/:target', 'PublicController.landingPage')

Route.get('web', 'PublicController.landingPage')
Route.get('web/:target', 'PublicController.landingPage')

Route.get('testPage', 'TestController.testPage')
Route.get('testPage/:version', 'TestController.testPage')

// Footer Pages
Route.get('faqs', 'PublicController.faqs')
Route.get('faqs/:faq', 'PublicController.faqs')

Route.get('team', 'PublicController.team')
Route.get('team/:member', 'PublicController.team')

Route.get('contactUs', 'PublicController.contactUs')
Route.get('contactUs/:from', 'PublicController.contactUs')

Route.get('investors', 'PublicController.investors')

Route.get('login', 'PublicController.login')
Route.get('register', 'PublicController.register')

Route.get('construction', 'PublicController.construction')

// API access
Route.get('/env', 'AuthController.env')
Route.get('/recoverPassword', 'AuthController.recoverPassword')
Route.get('/resetPassword', 'AuthController.resetPassword')
Route.get('/accessResetPassword', 'AuthController.accessResetPassword')
Route.get('/accessResetPassword/:token', 'AuthController.accessResetPassword')
Route.get('/confirmRegistration/:token', 'AuthController.confirmRegistration')
Route.get('/resendWelcome', 'AuthController.resendWelcome')

Route.post('/env', 'AuthController.env')
Route.post('/recoverPassword', 'AuthController.recoverPassword')
Route.post('/accessResetPassword', 'AuthController.accessResetPassword')
Route.post('/accessResetPassword/:token', 'AuthController.accessResetPassword')
Route.post('/resetPassword', 'AuthController.resetPassword')
Route.post('/confirmRegistration', 'AuthController.confirmRegistration')

Route.post('/message', 'PublicController.message')
Route.get('/message', 'PublicController.message')

Route.get('/docs', 'HelpController.viewDoc')
Route.post('/docs', 'HelpController.viewDoc')

// Public Routes:

Route.get('recover', 'PublicController.recoverPassword')
Route.post('recover', 'PublicController.recoverPassword')

Route.post('login', 'AuthController.login')

// Route.get('/logout', 'AuthController.logout')
Route.post('logout', 'AuthController.logout')

// Route.get('/register', 'AuthController.register')
Route.post('register', 'AuthController.register')

Route.get('/check', 'AuthController.check')
Route.post('/check', 'AuthController.check')

// Generic routes
Route.get('/loadTable', 'DBFormController.loadTable')
Route.get('/loadTable/:table', 'DBFormController.loadTable')
Route.post('/loadTable', 'DBFormController.loadTable')
Route.post('/saveForm', 'DBFormController.saveRecord')

// Generic routes
Route.get('/search', 'GenericController.search')
Route.get('/getData', 'GenericController.search')
Route.get('/describe', 'GenericController.describe')

