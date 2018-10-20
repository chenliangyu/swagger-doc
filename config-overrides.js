
const { getLoader,compose } = require("react-app-rewired");
const tsImportPluginFactory = require('ts-import-plugin')
const path = require("path");
const minimist = require("minimist")
const fs = require("fs-extra")
const webpack = require("webpack");

const addAntdPlugin = (config) => {
  const tsLoader = getLoader(
    config.module.rules,
    rule =>
    rule.loader &&
    typeof rule.loader === 'string' &&
    rule.loader.includes('ts-loader')
  );

  tsLoader.options = {
    getCustomTransformers: () => ({
      before: [
        tsImportPluginFactory([{
            libraryDirectory: 'es',
            libraryName: 'antd',
            style: 'css',
        }]),
      ]
    })
  };
  return config;
}

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

const getSpec = () => {
  const args = minimist(process.argv.slice(4),{
    alias :{
      "f":"specFolder"
    }
  })
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

const updateEnv = (config) => {
  for(let i = 0;i<config.plugins.length;i++){
    const plugin = config.plugins[i];
    if(plugin instanceof webpack.DefinePlugin){
      plugin.definitions["process.env"] = {...plugin.definitions["process.env"],"SWAGGER_API_TREE":getSpec()}
      console.log(plugin);
      return config;
    }
  }
  return config;
}

module.exports = (config,env) => {
  const rewires = compose(addAntdPlugin,updateEnv)
  return rewires(config,env);
}