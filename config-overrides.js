
const { getLoader,compose } = require("react-app-rewired");
const tsImportPluginFactory = require('ts-import-plugin')
const path = require("path");
const minimist = require("minimist")
const fs = require("fs-extra")
const webpack = require("webpack");
const {generateSpecs} = require("./generate_spec");

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

const updateEnv = (config) => {
  const args = minimist(process.argv.slice(2))
  for(let i = 0;i<config.plugins.length;i++){
    const plugin = config.plugins[i];
    if(plugin instanceof webpack.DefinePlugin){
      plugin.definitions["process.env"] = {
        ...plugin.definitions["process.env"],
        "SWAGGER_SPECS":generateSpecs(args),
        "SWAGGER_BASE_PATH":args.basePath,
        "SWAGGER_SERVER":args.server
      }
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