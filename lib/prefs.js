var inquirer    = require('inquirer');
var stages      = require('./stages');

function getStageNames() {
  return stages.map(function(stage) {
    return stage.name;
  })
}

module.exports = function getSiteInfo(callback) {
  var questions = [
    {
      name: 'stage',
      type: 'list',
      message: 'Which environment do you want to deploy?',
      choices: getStageNames()
    },
    // {
    //   name: 'sshServer',
    //   type: 'input',
    //   message: 'Enter the SSH server host. It is assumed you are authenticating by public key:',
    //   validate: function(value) {
    //     if (value.length) {
    //       return true;
    //     } else {
    //       return 'Please enter the SSH host';
    //     }
    //   }
    // },
    // {
    //   name: 'sshPath',
    //   type: 'input',
    //   message: 'What is the path of the site?',
    //   validate: function( value ) {
    //     if (value.length) {
    //       return true;
    //     } else {
    //       return 'Please enter the path.';
    //     }
    //   }
    // },

  ];

  inquirer.prompt(questions).then(callback);
}