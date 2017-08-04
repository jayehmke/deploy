var chalk = require('chalk');
var clear = require('clear');
var CLI = require('clui');
var figlet = require('figlet');
var inquirer = require('inquirer');
var Preferences = require('preferences');
var Spinner = CLI.Spinner;
var _ = require('lodash');
var git = require('simple-git')();
var touch = require('touch');
var fs = require('fs');
var SSH = require('simple-ssh');

var files = require('./lib/files');
var stages = require('./lib/stages');
var getPrefs = require('./lib/prefs');
var codes = require('./lib/statusCodes');

clear();
console.log(
  chalk.yellow(
    figlet.textSync('Let\'s Deploy!', {horizontalLayout: 'full'})
  )
);

getPrefs(function (args) {
  console.log('Stage to deploy', args.stage);
  var deployStage = _.find(stages, function (item) {
    return item.name == args.stage;
  });

  console.log('Stage path: ', deployStage.path)

  var ssh = new SSH({
    host: 'sip4-817.nexcess.net',
    user: 'testdiam',
    pass: 'diGROC8BQwTB',
    agent: process.env.SSH_AUTH_SOCK,
    baseDir: deployStage.path
  });
  ssh
    .exec('echo "Checking for files" && git diff --quiet || exit 1', {
      out: console.log.bind(console),
      exit: function (code, stdout,stderr) {
        if (code != 0){
          console.log(chalk.red('Exiting with code', code));
          console.log(chalk.red('Code ' + code + ':' + codes[code]));
          if (stderr) {
            console.log(chalk.red('ERROR!', stderr))
          }
          return false;
        }
      }
    })
    .exec('touch html/maintenance.flag', {
      out: console.log.bind(console),
      exit: function(code, stdout,stderr) {
        console.log(chalk.green('Putting site into maintenance'));
        if (stderr) {
          console.log(chalk.red('ERROR!', stderr))
        }
      }
    })
    .exec('git fetch origin && git reset --hard origin/' + deployStage.branch, {
      out: console.log.bind(console),
      exit: function(code, stdout,stderr) {
        console.log(chalk.green('Fetching branch and checking out new changes.'));
        if (stderr) {
          console.log(chalk.red('ERROR!', stderr))
        }
      }
    })
    // .exec('git update-index --assume-unchanged app/etc/local.xml', {
    //   out: console.log.bind(console),
    //   exit: function(code, stdout,stderr) {
    //     console.log(chalk.green('Telling Git to ignore temporarily local.xml'));
    //     if (stderr) {
    //       console.log(chalk.red('ERROR!', stderr))
    //     }
    //   }
    // })
    .exec('/bin/cp -f html/app/etc/local.xml.' + deployStage.suffix + ' html/app/etc/local.xml', {
      out: console.log.bind(console),
      exit: function(code, stdout,stderr) {
        console.log(chalk.green('Copying local.xml'));
        if (stderr) {
          console.log(chalk.red('ERROR!', stderr))
        }
      }
    })
    // .exec('git update-index --no-assume-unchanged app/etc/local.xml', {
    //   out: console.log.bind(console),
    //   exit: function(code, stdout,stderr) {
    //     console.log(chalk.green('Telling Git to resume tracking local.xml'));
    //     if (stderr) {
    //       console.log(chalk.red('ERROR!', stderr))
    //     }
    //   }
    // })
    .exec('/bin/cp -f html/robots.txt.' + deployStage.suffix + ' html/robots.txt', {
      out: console.log.bind(console),
      exit: function(code, stdout,stderr) {
        console.log(chalk.green('Copying robots.txt'));
        if (stderr) {
          console.log(chalk.red('ERROR!', stderr))
        }
      }
    })
    .exec('/bin/cp -f html/.htaccess.' + deployStage.suffix + ' html/.htaccess', {
      out: console.log.bind(console),
      exit: function (code, stdout,stderr) {
        console.log(chalk.green('Copying htaccess'));
        if (stderr) {
          console.log(chalk.red('ERROR!', stderr))
        }
      }
    })
    .exec('rm -rf html/var/cache/*', {
      exit: function(code, stdout,stderr) {
        console.log(chalk.green('Clearing Magento Cache'));
        if (stderr) {
          console.log(chalk.red('ERROR!', stderr))
        }
      }
    })
    .exec('rm -f html/maintenance.flag', {
      out: console.log.bind(console),
      exit: function(code, stdout,stderr) {
        console.log(chalk.green('Taking site out of maintenance'));
        if (stderr) {
          console.log(chalk.red('ERROR!', stderr))
        }
      }
    })
    .start();

});



// if (!files.directoryExists('.git')) {
//   console.log(chalk.red('Not a git repository. Exiting.'));
//   process.exit();
// }
