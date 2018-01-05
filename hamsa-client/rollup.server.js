import config from './rollup.config';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload'

config.plugins.push(
  serve('dist'),
  livereload()
);

export default config;
