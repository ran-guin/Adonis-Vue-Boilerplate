'use strict'

const { test, trait } = use('Test/Suite')('Public Pages')

trait('Test/Browser')

console.log('Host: ' + process.env.HOST)
console.log('Port: ' + process.env.PORT)

test('Public Home', async ({ assert, browser }) => {
  const pub = await browser.visit('/')
  await pub.assertHas('Public Home Page')
})

test('About', async ({ assert, browser }) => {
  const about = await browser.visit('/about')
  await about.assertHas('About')
}) 

test('Contact', async ({ assert, browser }) => {
  const contact = await browser.visit('/contact')
  await contact.assertHas('Contact Us')
})

test('Public Direct', async ({ assert, browser }) => {
  const pub2 = await browser.visit('/public')
  await pub2.assertHas('Public Home Page')
})

test('Login Form', async ({ assert, browser }) => {
  const page = await browser.visit('/login')
  await page.assertHas('Login')
 })

 
test('Register Form', async ({ assert, browser }) => {
  const page = await browser.visit('/register')
  await page.assertHas('Register')
 })
 
test('Recover Password Form', async ({ assert, browser }) => {
  const page = await browser.visit('/recover')
  await page.assertHas('Password Recovery')
})

// test('Inaccessible Default Pages', async ({ assert, browser }) => {
  // const profile = await browser.visit('/profile')
  
  // const dashboard = await browser.visit('/dashboard')
// })

trait('Test/ApiClient')

test('Default public routes', async ({ assert, client }) => {
  const response = await client.get('/env').end()
  const env = JSON.parse(response.text)
  assert.equal(env.db_user, 'tester', 'test user defined')
})

test('Default private routes', async ({ assert, client }) => {
  const response = await client.get('/env').end()
  const env = JSON.parse(response.text)
  assert.equal(env.db_user, 'tester', 'test user defined')
})
