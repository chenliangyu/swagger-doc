
const { getLoader, compose } = require("react-app-rewired");
const tsImportPluginFactory = require('ts-import-plugin')
const path = require("path");
const minimist = require("minimist")
const fs = require("fs-extra")
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { generateSpecs } = require("./generate_doc/generate_spec");


const addSourcemapLoader = (config) => {
  console.log(config);
  config.module.rules.push({
    test: /\.js$/,
    use: ["source-map-loader"],
    enforce: "pre",
    include: [/node_modules\/swagger-ui/]
  })
  return config;
}


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
  for (let i = 0; i < config.plugins.length; i++) {
    const plugin = config.plugins[i];
    if (plugin instanceof webpack.DefinePlugin) {
      plugin.definitions["process.env"] = {
        ...plugin.definitions["process.env"],
        "SWAGGER_SPECS": JSON.stringify(generateSpecs(args)),
        "SWAGGER_BASE_PATH": JSON.stringify(args.basePath),
        "SWAGGER_SERVER": JSON.stringify(args.server)
      }
      break;
    }
  }
  return config;
}

const dontMinifyJSInHtml = (config) => {
  for (let i = 0; i < config.plugins.length; i++) {
    const plugin = config.plugins[i];
    if (plugin instanceof HtmlWebpackPlugin) {
      if (plugin.options.minify && typeof plugin.options.minify !== "boolean") {
        plugin.options.minify = { ...plugin.options.minify, minifyJS: false }
      }
      console.log(plugin);
      break;
    }
  }
  return config
}


module.exports = (config, env) => {
  const rewires = compose(addSourcemapLoader, addAntdPlugin, updateEnv, dontMinifyJSInHtml)
  return rewires(config, env);
}