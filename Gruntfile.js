///<reference path='./_references.d.ts'/>
var childProcess = require('child_process');
function init(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            "options": {
                "force": true
            },
            "typescript": ["*/**/*.js", "*/**/*.js.map", "*/**/*.d.ts", "!_references.d.ts", "!Gruntfile.js", "!node_modules/**/*.js"]
        },
        concat: {
            server: {
                src: ['enums/*.d.ts', 'models/*.d.ts', 'dao/*.d.ts', 'delegates/*.d.ts', 'common/*.d.ts', 'caches/*.d.ts', 'api/*.d.ts'],
                dest: 'coraljs-server.d.ts',
                options: {
                    banner: "declare module 'coral.js'\n{\nimport q = require(\"q\");\nimport log4js = require(\"log4js\");\nimport redis = require(\"redis\");\nimport express = require(\"express\");\n\n",
                    footer: '}'
                }
            },
            client: {
                src: ['enums/*.d.ts', 'models/*.d.ts', 'common/*.d.ts', "delegates/BaseDaoDelegate.d.ts", "dao/IDaoFetchOptions.d.ts", "dao/IDao.d.ts"],
                dest: 'coraljs-client.d.ts',
                options: {
                    banner: "declare module 'coral.js'\n{\nimport log4js = require(\"log4js\");\nimport q = require(\"q\");\n",
                    footer: '}'
                }
            }
        },
        replace: {
            'coral-ts': {
                src: ['coraljs-client.d.ts', 'coraljs-server.d.ts'],
                overwrite: true,
                replacements: [
                    {
                        from: /export =.*/g,
                        to: ''
                    },
                    {
                        from: /declare (class|enum|interface)/g,
                        to: 'export $1'
                    },
                    {
                        from: /\/\/\/ \<reference .*/g,
                        to: ''
                    },
                    {
                        from: /import[^"^\n]*;/g,
                        to: ''
                    }
                ]
            }
        },
        "typescript": {
            "coral-index": {}
        },
        "sqlToModel": {
            "target": {}
        }
    });
    /* Generate indx.js by combining all generated .js files */
    grunt.registerMultiTask('generate-index', function () {
        this.files.forEach(function (file) {
            var output = file.src.map(function (filepath) {
                var filename = filepath.match(/\/([A-Za-z]*)\.js/);
                return 'exports.' + filename[1] + ' = require("./' + filepath + '");';
            }).join('\n');
            grunt.file.write(file.dest, output);
        });
    });
    grunt.registerMultiTask("typescript", function () {
        var exec = childProcess.exec;
        var done = this.async();
        exec('tsc -m commonjs -d --sourcemap index.ts', function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            done();
        });
    });
    grunt.registerMultiTask("sqlToModel", function () {
        var sqlString = grunt.option('sql');
        var sqlToModel = require('./common/sqlToModel');
        console.log(sqlString);
        sqlToModel.sqlToModel(sqlString);
    });
    grunt.registerTask('default', ['clean', 'typescript', 'concat', 'replace']);
}
module.exports = init;
//# sourceMappingURL=Gruntfile.js.map