const Route = use('Route')

Route.on('/').render('welcome')

Route.get('/dataset', 'DatumController.query')
Route.put('/dataset/:id', 'DatumController.update')
Route.post('/dataset', 'DatumController.append')
Route.delete('/dataset/:id', 'DatumController.delete')

