#!/usr/bin/env node

var bcrypt = require('bcrypt');
var program = require('commander');

program
.version('0.0.1')
.option('-h, --hash <password>', 'Generate hash')
.parse(process.argv);
console.log(program.hash);
if(program.hash){
  console.log( bcrypt.hashSync(program.hash, 8));
}
