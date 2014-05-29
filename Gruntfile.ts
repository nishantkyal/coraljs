///<reference path='./_references.d.ts'/>
import q                                                    = require('q');
import Config                                               = require('./common/Config');
import MysqlDelegate                                        = require('./delegates/MysqlDelegate');

function init(grunt)
{
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-promise-q');
    grunt.loadNpmTasks('grunt-typescript');

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
        },
        typescript: {
            src: ['app.ts'],
            options: {
                module: 'commonjs', //or commonjs
                target: 'es5', //or es3
                basePath: '.',
                sourceMap: false,
                declaration: false
            }
        },
        clean: {
            typescript: ["*/**/*.js", '!Gruntfile.js', '!public/**/*.js', '!node_modules/**/*.js']
        }
    });

    grunt.registerTask('default', ['concat:js', 'concat:css', 'cssmin:css']);
}

export = init;