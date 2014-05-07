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
                src: ['enums/*.d.ts', 'models/*.d.ts', 'delegates/ApiUrlDelegate.d.ts', 'common/*.d.ts'],
                dest: 'Coral.d.ts',
                options: {
                    banner: "declare module 'Coral'\n{\n",
                    footer: '}'
                }
            },
            css: {
                src: [
                    'public/css/!(combined|main).css*'
                ],
                dest: 'public/css/combined.css'
            },
            js: {
                src: ['public/js/lib/jquery.js', 'public/js/lib/jquery.validate.js', 'public/js/lib/!(combined).js', 'public/js/lib/!(combined).js'],
                dest: 'public/js/lib/combined.js'
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
                        from: /import.*\..*/g,
                        to: ''
                    }
                ]
            }
        },
        uglify: {
            js: {
                files: {
                    'public/js/lib/combined.min.js': ['public/js/lib/combined.js']
                }
            }
        },
        cssmin: {
            css: {
                src: 'public/css/combined.css',
                dest: 'public/css/combined.min.css'
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

    grunt.registerTask('coral', ['clean', 'concat', 'replace', 'generate-index']);
    grunt.registerTask('default', ['concat:js', 'concat:css', 'cssmin:css']);
}

module.exports = init;
//# sourceMappingURL=Gruntfile.js.map
