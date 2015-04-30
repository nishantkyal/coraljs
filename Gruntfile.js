function init(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-ts');
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
                src: ['enums/*.d.ts', 'models/*.d.ts', 'dao/*.d.ts', 'delegates/*.d.ts', 'common/*.d.ts', 'caches/*.d.ts', 'api/*.d.ts'],
                dest: 'coraljs.d.ts',
                options: {
                    banner: "declare module 'coraljs'\n{\nimport q = require(\"q\");\nimport log4js = require(\"log4js\");\nimport redis = require(\"redis\");\nimport express = require(\"express\");\n\n",
                    footer: '}'
                }
            }
        },
        replace: {
            'coral-ts': {
                src: ['coraljs.d.ts'],
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
                "options": {
                    "module": "commonjs",
                    sourceMap: true
                }
            },
            "client": {
                "src": ["indexWebapp.ts"],
                "options": {
                    "module": "amd",
                    sourceMap: true
                }
            }
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
    grunt.registerTask('default', ['clean', 'ts', 'concat', 'replace']);
}
module.exports = init;
//# sourceMappingURL=Gruntfile.js.map