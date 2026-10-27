const path = require("path");

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    client: {
      jasmine: {
        random: false,
      },
    },
    files: ["tests/setup.js", "tests/**/*.test.js"],
    preprocessors: {
      "tests/setup.js": ["webpack"],
      "tests/**/*.test.js": ["webpack"],
    },
    webpack: {
      mode: "development",
      devtool: "inline-source-map",
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                configFile: path.resolve(__dirname, "tests/babel.config.js"),
              },
            },
          },
        ],
      },
      resolve: {
        extensions: [".js"],
        alias: {
          "@": path.resolve(__dirname),
          "next/link": path.resolve(__dirname, "tests/mocks/next-link.js"),
          "next/navigation": path.resolve(
            __dirname,
            "tests/mocks/next-navigation.js"
          ),
        },
      },
    },
    webpackMiddleware: {
      stats: "errors-only",
    },
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jsdom-launcher"),
      require("karma-webpack"),
    ],
    reporters: ["progress"],
    browsers:
      process.env.KARMA_BROWSER === "jsdom"
        ? ["jsdom"]
        : ["ChromeHeadlessNoSandbox"],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
      },
    },
    singleRun: true,
    colors: true,
    captureTimeout: 60000,
    browserNoActivityTimeout: 60000,
  });
};
