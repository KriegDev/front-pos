module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { chrome: "120" }, modules: false }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
