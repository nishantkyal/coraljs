///<reference path='./_references.d.ts'/>
import q                                                    = require('q');
import Config                                               = require('./common/Config');
import MysqlDelegate                                        = require('./delegates/MysqlDelegate');

function init(grunt)
{
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-typescript');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            "options": {
                "force": true
            },
            "typescript": ["*/**/*.js", "*/**/*.js.map", "*/**/*.d.ts", "!Gruntfile.js", "!node_modules/**/*.js"]
        },
        concat: {
            dist: {
                src: ['enums/*.d.ts', 'models/*.d.ts', 'dao/*.d.ts', 'delegates/*.d.ts', 'common/*.d.ts', 'caches/*.d.ts'],
                dest: 'Coral.d.ts',
                options: {
                    banner: "///<reference path='_references.d.ts'/>\ndeclare module 'Coral'\n{\nimport q = require(\"q\");\nimport log4js = require(\"log4js\");\nimport redis = require(\"redis\");\n\n",
                    footer: '}'
                }
            }
        },
        'generate-index': {
            target: {
                src: ['enums/*.js', 'models/*.js', 'dao/*.js', 'delegates/*.js', 'common/*.js', 'caches/*.js'],
                dest: 'index.js'
            }
        },
        replace: {
            'coral-ts': {
                src: ['Coral.d.ts'],
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
            "coral": {
                "src": ['models\\*.ts', '!*\\*.d.ts'],
                "options": {
                    "module": 'commonjs', //or commonjs
                    "target": 'es5', //or es3
                    "basePath": '.',
                    "sourceMap": false,
                    "declaration": true
                }
            }
        }
    });

    /* Generate indx.js by combining all generated .js files */
    grunt.registerMultiTask('generate-index', function ()
    {
        this.files.forEach(function (file)
        {
            var output = file.src.map(function (filepath)
            {
                var filename = filepath.match(/\/([A-Za-z]*)\.js/);
                return 'exports.' + filename[1] + ' = require("./' + filepath + '");';
            }).join('\n');
            grunt.file.write(file.dest, output);
        });
    });


    grunt.registerTask('default', ['concat', 'replace', 'generate-index']);
}

export = init;