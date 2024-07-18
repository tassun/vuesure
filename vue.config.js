const path = require("path");
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({  
  pages: {
    index: {
      entry: 'src/vuesure.js',
      title: 'Vue Sure',
    }
  },
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' /* this is BASE_URL in index.html */
    ? './' /*+ process.env.CI_PROJECT_NAME + '/'*/
    : './',
  configureWebpack: {
    devtool: "source-map",
    optimization: {
      minimize: false
    },
    resolve: {
      alias: {
        // bind version of jquery-ui
        "jquery-ui": "jquery-ui-dist/jquery-ui.js",
        // bind to modules;
        modules: path.join(__dirname, "node_modules")
      }
    },
    devServer: {
      headers: { "Access-Control-Allow-Origin": "*", "X-Frame-Options": "ALLOW-FROM http://localhost:8080" }
    },    
  }    
})
