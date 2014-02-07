module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['Coral.d.ts'],
        concat: {
            options: {
                banner: "declare module 'Coral'\n{\n",
                footer: '}'
            },
            dist: {
                src: ['enums/*.d.ts', 'models/*.d.ts', 'delegates/ApiUrlDelegate.d.ts', 'common/*.d.ts'],
                dest: 'Coral.d.ts'
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
                        from: /import.*/g,
                        to: ''
                    }
                ]
            }
        }
    });

    // our example task
    grunt.registerMultiTask('generate-index', function() {
        this.files.forEach(function(file) {
            var output = file.src.map(function(filepath) {
                var filename = filepath.match(/\/([A-Za-z]*)\.js/);
                return 'exports.' + filename[1] + ' = require("./' + filepath + '");';
            }).join('\n');
            grunt.file.write(file.dest, output);
        });
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.registerTask('default', ['clean', 'concat', 'replace', 'generate-index']);
};