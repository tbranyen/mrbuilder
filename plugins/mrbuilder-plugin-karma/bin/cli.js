#!/usr/bin/env node
const path                     = require('path');
const { env, argv, cwd }       = process;
env.MRBUILDER_INTERNAL_PLUGINS =
    [env.MRBUILDER_INTERNAL_PLUGINS, 'mrbuilder-plugin-babel', 'mrbuilder-plugin-webpack', 'mrbuilder-plugin-karma', 'mrbuilder-plugin-enzyme'].join(
        ',');

if (!env.NODE_ENV) {
    env.NODE_ENV = 'test';
}
global._MRBUILDER_OPTIONS_MANAGER
                       || (    global._MRBUILDER_OPTIONS_MANAGER =
        new (require('mrbuilder-optionsmanager').default)(
            { prefix: 'mrbuilder', _require: require }));

const {
          MRBUILDER_COVERAGE,
          MRBUILDER_COVERAGE_DIR,
          MRBUILDER_COVERAGE_USE_GLOBAL,
          npm_lifecycle_event,
      } = env;


function indexOfArg() {
    const args = argv.slice(2);
    for (let i = 0, l = arguments.length; i < l; i++) {
        let idx = args.indexOf(arguments[i]);
        if (idx != -1) {
            return idx;
        }
    }
    return -1;
}

const conf = path.resolve(__dirname, '..', 'karma.conf.js');
let pos;
if ((pos = indexOfArg('start', 'init', 'run', 'completion')) == -1) {
    argv.splice(2, 0, 'start', conf);
} else {
    argv.splice(pos - 1, 0, conf);
}
//only do single run if test event cycle or prepublish.
if (npm_lifecycle_event === 'test' || npm_lifecycle_event === 'prepublish') {
    if (!argv.includes('--single-run', 2)) {
        argv.push('--single-run');
    }
}
if (MRBUILDER_COVERAGE || MRBUILDER_COVERAGE_DIR
    || MRBUILDER_COVERAGE_USE_GLOBAL) {
    env.MRBUILDER_COVERAGE = 1;
    if (!argv.includes('--single-run', 2)) {
        argv.push('--single-run');
    }
    if (MRBUILDER_COVERAGE_USE_GLOBAL) {
        env.MRBUILDER_COVERAGE_DIR = path.resolve(cwd(), '..', 'coverage',
            path.basename(cwd()))
    }
}

if (argv.includes('--single-run', 2) && !argv.includes('--browser', 2)) {
    argv.push('--browser', 'Firefox');
}
if (!env.NODE_ENV) {
    env.NODE_ENV = 'test';
}
env.MRBUILDER_MAIN_FIELDS = 1;
env.MRBUILDER_KARMA       = 1;
require('karma-cli/bin/karma');
