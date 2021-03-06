const { camelCased, cwd, resolveMap } = require('mrbuilder-utils');
const DEFAULT_MAIN_FIELDS             = ['browser', 'main'];
const SOURCE_MAIN_FIELDS              = ['source', 'browser', 'main'];

const mod = function ({
                          library,
                          libraryTarget = 'commonjs2',
                          extensions = ['.js', '.jsx'],
                          mainFields = true,
                          app,
                          entry,
                          demo,
                          outputPath = cwd('lib'),
                          useExternals,
                          externalizePeers = true,
                          externals,
                          devtool = 'source-maps',
                          filename = '[name].[hash].js',
                          alias = [
                              'react',
                              'react-dom'
                          ]
                      },
                      webpack) {

    if (!webpack.resolve) {
        webpack.resolve = {
            alias: {}
        };
    }
    const info = this.info || console.log;

    const pkg = require(cwd('package.json'));

    if (alias) {
        if (typeof alias === 'string') {
            alias = alias.split(/,\s*/);
        }
        if (Array.isArray(alias)) {
            webpack.resolve.alias = Object.assign(webpack.resolve.alias,
                Array.isArray(alias) ? resolveMap(...alias) : alias
            );
        } else {
            webpack.alias = alias;
        }
    }

    if (!webpack.output) {
        webpack.output = {};
    }

    if (outputPath) {
        webpack.output.path = outputPath;
    }

    demo = demo || app;

    if (this.isLibrary) {
        webpack.output.library       =
            typeof library == 'string' ? library : camelCased(pkg.name);
        webpack.output.libraryTarget = libraryTarget;
        //Don't hash when its a library
        webpack.output.filename      = filename.replace('[hash].', '');
    } else if (this.isDevServer) {
        //Don't hash when its running in devServer
        webpack.output.filename = filename.replace('[hash].', '');
    } else {
        webpack.output.filename = filename;
    }
    if (demo) {
        webpack.output.path = demo === true ? cwd('demo') : cwd(demo);
    }

    if (this.isDevServer || demo) {
        info('output filename', webpack.output.filename);
    }

    if (extensions) {
        webpack.resolve.extensions = extensions;
    }

    if (this.isLibrary && (useExternals !== false)) {

        let externals = [];
        if (Array.isArray(useExternals)) {
            externals = useExternals;
        } else if (typeof useExternals === 'string') {
            externals = useExternals.split(/,\s*/);
        }

        if (externalizePeers && pkg.peerDependencies) {
            externals = externals.concat(Object.keys(pkg.peerDependencies));
        }

        webpack.externals = Object.keys(externals.reduce((ret, key) => {
            ret[key] = key;
            return ret;
        }, {}));

        info('packaging as externalize', webpack.externals);
    }

    if (mainFields) {
        mainFields                 =
            typeof mainFields === 'string' ? mainFields.split(/,\s*/)
                : mainFields;
        mainFields                 =
            Array.isArray(mainFields) ? mainFields : mainFields === true
                ? webpack.target == 'node' ? ['source', 'main']
                                                         : SOURCE_MAIN_FIELDS
                : DEFAULT_MAIN_FIELDS;
        webpack.resolve.mainFields = mainFields;
        info(`using mainFields`, mainFields);
    }

    webpack.devtool = devtool;

    return webpack;


};

module.exports = mod;
