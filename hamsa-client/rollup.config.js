// rollup.config.js
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';
import scss from 'rollup-plugin-scss'

export default {
  entry: 'src/main.js',
  format: 'cjs',
  plugins: [
    json({
      exclude: ["node_modules/**"]
    }),

    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),

    commonjs({
       include: "node_modules/**"
    }),

    scss(),

    //uglify()

  ],
  dest: 'dist/bundle.min.js',
  sourceMap: true
};
