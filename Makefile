target: start clone customDirs plugin copy npm finish

start:
	@echo *** Intiate Custom Build ***
	@echo
clone:
	@echo "*** Clone Boilerplate ***"

	git clone https://github.com/ran-guin/Adonis-Vue-Boilerplate ./
	@echo

customDirs:
	mkdir -p ./test/custom/functional

plugin:
	@echo ... run plugin installation ...
	node ./../install.js
	@echo

	echo '' >> .gitignore
	echo ### Customized Files from Plugin ### >> .gitignore
	cat ./../install/.gitignoreFiles >> ./.gitignore
adonis:
	@echo generate key
	adonis key:generate

clientEnv:
	@echo 'export default {' > .env.client
	@echo '  '  PLUGIN_URL: "$(PLUGIN_URL)" >> .env.client
	@echo '  '  PLUGIN_PORT: \'$$PLUGIN_PORT\' >> .env.client
	@echo '  '  GOOGLE_API_KEY: '"' $$GOOGLE_API_KEY '"' >> .env.client
	@echo '  '  DEBUG_MODE: $$DEBUG_MODE >> .env.client
	@echo '}' >> .env.client
	
	@echo ' *** Use ENV Variables to generate client side configs ***  '
	@echo '  '  PLUGIN_URL=$$PLUGIN_URL
	@echo '  '  PLUGIN_PORT=$$PLUGIN_PORT
	@echo '  '  GOOGLE_API_KEY=$$GOOGLE_API_KEY
	@echo '  '  DEBUG_MODE=$$DEBUG_MODE

	@echo *** Generated custom config for client ***

serverEnv:
	@echo ' *** Use ENV Variables to generate custom server side .env ***  '
	
	@echo '  '  API_KEY=$$API_KEY > .env.server
	@echo '  '  DB_DATABASE:$$DBDATABASE >> .env.server
	@echo '  '  DB_USER:$$DB_USER >> .env.server
	@echo '  '  DB_PASSWORD:$$DB_PASSWORD >> .env.server
	
	@echo *** Generated custom ENV for server ***
	
	@echo '  '  API_KEY=$$API_KEY 
	@echo '  '  DB_DATABASE:$$DBDATABASE
	@echo '  '  DB_USER:$$DB_USER
	@echo '  '  DB_PASSWORD:$$DB_PASSWORD

copy:
	cat ./../.env.init > ./.env
	cat .env.server >> ./.env

	cat .env.client > ./client/src/config.private.js

	@echo "*** Copied ENV to server and custom configs to client ***"

npm:
	npm install
	@echo '*** Installed NPM modules for server ***'

precompile:
	@echo Finishing script
	$(shell ./finish.sh)
	bash ./recompile local
	
finish:
	@echo *** Finished ***
	@echo

