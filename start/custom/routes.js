const Route = use('Route')

Route.on('/').render('welcome')
Route.get('/dump', 'DatumController.dump')
Route.get('/view', 'DatumController.dataview')
Route.get('/vuetify', 'DatumController.vuetify')

