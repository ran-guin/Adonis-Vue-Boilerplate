
const { exec } = require('child_process');

// ### Setup fresh baseline Adonis + Vue

// execute('bash rebuild-template.sh')

// ## Update with custom boilerplate components

const include = [
  { dir: 'app/Controllers' }, 
  { dir: 'database' }, 
  { dir: 'start' }, 
  { dir: 'client/src/layouts' },
  { dir: 'client/src/pages' },
  { dir: 'client/src/assets' },
  { dir: 'client/src/store' },
  { dir: 'app/Models', files: '*.*' },
  { dir: 'client/src/components', files: '*.*' },
  { dir: '.', files: '.env.*' },
  { dir: '.', files: 'recompile' },
  { dir: '.', files: 'rebuild*.*' }
];

const replace = [
  'client/src/App.vue',
  'client/src/main.js'
];

for (var i=0; i<include.length; i++) {
  var dir = include[i].dir;
  var files = include[i].files;
  var cmd = 'cp -R ' + dir 
  if (files) {
    cmd = cmd + '/' + files + ' rebuilt/' + dir;
  } else {
    cmd = cmd + ' rebuilt/' + dir;
  }
  execute(cmd);
}

for (var i=0; i<replace.length; i++) {
  var cmd = 'cp ' + replace[i] + ' rebuilt/' + replace[i];
  execute(cmd);
}


function execute (cmd) {
  console.log('** execute: ' + cmd);
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error(`error: ${err}`);
      // node couldn't execute the command
      return;
    }

    // the *entire* stdout and stderr (buffered)
    if (stdout) { console.log(`stdout: ${stdout}`) }
    if (stderr) { console.log(`stderr: ${stderr}`) }
  });
}
