
const { exec } = require('child_process');

// ### Setup fresh baseline Adonis + Vue

// execute('bash rebuild-template.sh')

// ## Update with custom boilerplate components

// *** Add new directories / files ... ***

const include = [

  //  *** New directories ***

  { dir: 'app/Controllers' }, 
  { dir: 'start' }, 
  { dir: 'client/src/layouts' },
  { dir: 'client/src/pages' },
  { dir: 'client/src/store' },
  { dir: 'client/src/auth' },

  //  *** New files in existing directories ***

  { dir: 'app/Models/', files: '*.*' },
  { dir: 'client/src/', files: 'config.js' },
  { dir: 'client/src/', files: 'router.js' },
  { dir: 'config/', files: 'cors.js' },
  { dir: 'config/', files: 'database.js' },
  { dir: 'config/', files: 'shield.js' },
  { dir: 'client/src/assets/', files: '*' },
  { dir: 'client/src/components/', files: '*.*' },
  { dir: './', files: '.env.*' },
  { dir: './', files: 'recompile' },
  { dir: './', files: 'rebuild*.*' },
  { dir: 'database/', files: '*' }, 
];

// *** Replace these existing files with updated versions of the same file ... ***
const replace = [
  'client/src/App.vue',
  'client/src/main.js'
];

const delete = [
  'client/src/store.js'
];

for (var i=0; i<include.length; i++) {
  var dir = include[i].dir;
  var files = include[i].files || '';
  var cmd = 'cp -R ' + dir 
  cmd = cmd + files + ' rebuilt/' + dir;
  execute(cmd);
}

for (var i=0; i<replace.length; i++) {
  var cmd = 'cp ' + replace[i] + ' rebuilt/' + replace[i];
  execute(cmd);
}

for (var i=0; i<delete.length; i++) {
  var cmd = 'rm ' + delete[i];
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
