function init(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-promise-q');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
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

    grunt.registerTask('default', ['concat:js', 'concat:css', 'cssmin:css']);
}

module.exports = init;
//# sourceMappingURL=Gruntfile.js.map
