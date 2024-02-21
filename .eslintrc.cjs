module.exports = {
  root: true, // 此项是用来告诉eslint找当前配置文件不能往父级查找
  env: {
    amd: true,
    es6: true,
    commonjs: true,
    node: true,
    browser: true,
  },
  // ignorePatterns: ['.eslintrc.js', 'vite.config.ts', '*.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    presets: ['@babel/preset-env', '@typescript-eslint'],
    parser: '@typescript-eslint/parser', // 解析ts
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'], // eslint规则
  },
  plugins: ['prettier'],
  globals: {
    JSX: true,
  },
};
