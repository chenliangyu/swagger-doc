#!/usr/bin/env node
const path = require("path");
const minimist = require("minimist")
const fs = require("fs-extra")
const handlebars = require("handlebars")
const {generateSpecs} = require("./generate_spec");

function main(){
  const args = minimist(process.argv.slice(2))
  console.log("args:",args);
  const templateFile = path.resolve(process.cwd(),args.src);
  try{
    const fileContent = fs.readFileSync(templateFile);
    const template = handlebars.compile(fileContent.toString());
    const specs =generateSpecs(args);
    const result = template({
      docOptions:JSON.stringify({
        specs:specs,
        basePath:args.basePath,
        server:args.server
      })
    })
    const targetFile = path.resolve(process.cwd(),args.target);
    fs.writeFileSync(targetFile,result);
  }catch(e){
    throw e;
  }
}

main()