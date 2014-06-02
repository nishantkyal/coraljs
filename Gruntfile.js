function init(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-promise-q');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-git');

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
        "typescript": {
            coral: {
                src: ['app.ts'],
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    basePath: '.',
                    sourceMap: false,
                    declaration: false
                }
            }
        },
        clean: {
            typescript: ["app.js", "*/**/*.js", '!Gruntfile.js', '!public/**/*.js', '!node_modules/**/*.js']
        },
        bumpup: {
            'files': ['package.json', 'bower.json']
        },
        prompt: {
            bumpup: {
                options: {
                    questions: [
                        {
                            config: 'bumpup.type',
                            type: 'list',
                            message: 'How do you want to bump up the version number for this release?',
                            default: 'patch',
                            choices: [
                                { name: 'patch', checked: true },
                                { name: 'major' },
                                { name: 'minor' },
                                { name: 'prerelease' },
                                { name: 'build' }
                            ]
                        }
                    ]
                }
            }
        },
        "prompt_bumpup": {
            "target": {}
        },
        "gitcommit": {
            "bumpup": {
                "message": "Released and bumped up project version",
                "files": {
                    'src': ['package.json', 'bower.json']
                }
            }
        },
        "gitpush": {
            "bumpup": {}
        }
    });

    grunt.registerMultiTask('prompt_bumpup', function () {
        grunt.task.run('bumpup:' + grunt.config('bumpup.type'));
    });

    grunt.registerTask('default', ['concat:js', 'concat:css', 'cssmin:css']);
    grunt.registerTask('release', ['clean:typescript', 'typescript:coral', 'prompt:bumpup', 'prompt_bumpup', "gitcommit:bumpup", "gitpush:bumpup"]);
}

module.exports = init;
//# sourceMappingURL=Gruntfile.js.map
