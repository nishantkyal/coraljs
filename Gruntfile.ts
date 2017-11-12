///<reference path='./_references.d.ts'/>
import childProcess                                         = require('child_process');
import semver                                               = require('semver');
function init(grunt)
{
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-prompt');

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
        },
        'bump': {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v<%= grunt.config("bump.version") %>',
                commitFiles: ['package.json', 'bower.json'],
                createTag: grunt.config("bump.files"),
                tagName: 'v<%= grunt.config("bump.version") %>',
                tagMessage: 'Version <%= grunt.config("bump.version") %>',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        },
        prompt: {
            bump: {
                options: {
                    questions: [
                        {
                            config:  'bump.increment',
                            type:    'list',
                            message: 'Bump version from ' + '<%= pkg.version %>' + ' to:',
                            choices: [
                                {
                                    value: 'build',
                                    name:  'Build:  '+ ('<%= pkg.version %>' + '-?') + ' Unstable, betas, and release candidates.'
                                },
                                {
                                    value: 'patch',
                                    name:  'Patch:  ' + semver.inc('<%= pkg.version %>', 'patch') + ' Backwards-compatible bug fixes.'
                                },
                                {
                                    value: 'minor',
                                    name:  'Minor:  ' + semver.inc('<%= pkg.version %>', 'minor') + ' Add functionality in a backwards-compatible manner.'
                                },
                                {
                                    value: 'major',
                                    name:  'Major:  ' + semver.inc('<%= pkg.version %>', 'major') + ' Incompatible API changes.'
                                },
                                {
                                    value: 'custom',
                                    name:  'Custom: ?.?.? Specify version...'
                                }
                            ]
                        },
                        {
                            config:   'bump.version',
                            type:     'input',
                            message:  'What specific version would you like',
                            when:     function (answers) {
                                return answers['bump.increment'] === 'custom';
                            },
                            validate: function (value) {
                                var valid = semver.valid(value);
                                return valid || 'Must be a valid semver, such as 1.2.3-rc1. See http://semver.org/ for more details.';
                            }
                        },
                        {
                            config:  'bump.files',
                            type:    'checkbox',
                            message: 'What should get the new version:',
                            choices: [
                                {
                                    value:   'package',
                                    name:    'package.json' + (!grunt.file.isFile('package.json') ? ' not found, will create one' : ''),
                                    checked: grunt.file.isFile('package.json')
                                },
                                {
                                    value:   'bower',
                                    name:    'bower.json' + (!grunt.file.isFile('bower.json') ? ' not found, will create one' : ''),
                                    checked: grunt.file.isFile('bower.json')
                                },
                                {
                                    value:   'git',
                                    name:    'git tag',
                                    checked: grunt.file.isDir('.git')
                                }
                            ]
                        }
                    ]
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

    grunt.registerTask('default', ['clean', 'ts:server', 'concat', 'replace']);
    grunt.registerTask('publish', ['prompt:bump', 'bump']);
}
export = init;