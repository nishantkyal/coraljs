function init(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-promise-q');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['Coral.d.ts'],
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
                src: ['enums/*.js', 'models/*.js', 'delegates/ApiUrlDelegate.js', 'common/*.js'],
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

    grunt.registerTask('default', ['clean', 'concat', 'replace', 'generate-index']);
}

module.exports = init;
//# sourceMappingURL=Gruntfile.js.map
