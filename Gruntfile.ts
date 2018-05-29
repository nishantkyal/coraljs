import semver                                               = require('semver');
function init(grunt)
{
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-bump');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            "options": {
                "force": true
            },
            "typescript": ["*/**/*.js", "*/**/*.js.map", "*/**/*.d.ts", "!_references.d.ts", "!Gruntfile.js", "!node_modules/**/*"]
        },
        concat: {
            coral: {
                src: ['server/enums/*.d.ts', 'server/models/*.d.ts', 'server/dao/*.d.ts', 'server/delegates/*.d.ts', 'server/common/*.d.ts', 'server/caches/*.d.ts', 'server/api/*.d.ts'],
                dest: 'index.d.ts',
                options: {
                    banner: "declare module 'coraljs'\n{\nimport log4js = require(\"log4js\");\nimport redis = require(\"redis\");\nimport express = require(\"express\");\n\n",
                    footer: '}'
                }
            }
        },
        replace: {
            'coral-ts': {
                src: ['index.d.ts'],
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
        "ts": {
            "server": {
                "src": ["index.ts"],
                "outDir": "server",
                "options": {
                    "module": "commonjs",
                    "target": "es2016",
                    "lib": ["es2016"],
                    sourceMap: true,
                    declaration: true
                }
            },
            "client": {
                "src": ["indexWebapp.ts"],
                "outDir": "client",
                "options": {
                    "module": "amd",
                    "target": "es2016",
                    "lib": ["ES2015"],
                    sourceMap: true
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

    grunt.registerTask('default', ['clean', 'ts:server', 'concat', 'replace', 'generate-index']);
}
export = init;