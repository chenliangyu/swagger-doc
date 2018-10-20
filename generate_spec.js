const path = require("path");
const fs = require("fs-extra")

const generateSpecArray = (folderPath,parent) => {
  const stat = fs.statSync(folderPath);
  const fileName = path.basename(folderPath);
  let result = [];
  result.push({name:fileName,parent})
  if(stat.isDirectory()){
    const files = fs.readdirSync(folderPath);
    files.forEach((file) => {
      const filePath = path.resolve(folderPath,file);
      result = result.concat(generateSpecArray(filePath,fileName));
    });
  }
  return result;
}

exports.generateSpecs = (args) => {
  if(args.specFolder){
    const folderPath = path.resolve(process.cwd(),args.specFolder);
    console.log("read spec file from :",folderPath);
    if(fs.pathExistsSync(folderPath)){
      try{
        const result = generateSpecArray(folderPath);
        return JSON.stringify(result);
      }catch(e){
        throw e;
      }
    }
  }
  return [];
}