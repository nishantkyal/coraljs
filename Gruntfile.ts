///<reference path='./_references.d.ts'/>
import q                                                    = require('q');
import childProcess                                         = require('child_process');
import moment                                               = require('moment');
import Config                                               = require('./common/Config');

function init(grunt)
{
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-symlink');
    grunt.loadNpmTasks('grunt-mysql-dump');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-promise-q');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        "rename": {
            "release": {
                "options": {
                    "ignore": true
                },
                "src": '/var/searchntalk/releases/release-' + grunt.file.readJSON('package.json').version,
                "dest": '/var/searchntalk/releases/release-' + grunt.file.readJSON('package.json').version + "_" + moment().format('DD_MMM_YYYY_hh_mm_ss')
            }
        },
        "copy": {
            "release": {
                "files": [
                    {expand: true, src: ["public/**/*", "app.js", "*/**/*.js", "!Gruntfile.js", "views/**/*", "node_modules/**/*", "package.json"], dest: '/var/searchntalk/releases/release-' + grunt.file.readJSON('package.json').version}
                ]
            }
        },
        "symlink": {
            "options": {
                "overwrite": true,
                "force": true
            },
            "release": {
                "src": "/var/searchntalk/releases/release-" + grunt.file.readJSON('package.json').version,
                "dest": "/var/searchntalk/releases/current"
            }
        },
        "db_dump": {
            "release": {
                "options": {
                    "title": Config.get(Config.DATABASE_NAME),

                    "database": Config.get(Config.DATABASE_NAME),
                    "user": Config.get(Config.DATABASE_USER),
                    "pass": Config.get(Config.DATABASE_PASS),
                    "host": Config.get(Config.DATABASE_HOST),

                    "backup_to": "/var/searchntalk/backups/" + moment().format('DD_MMM_YYYY_hh_mm_ss') + ".sql"
                }
            }
        },
        "concat": {
            "css": {
                "src": [
                    'public/bower_dependencies/bootstrap/dist/css/bootstrap.css',
                    'public/bower_dependencies/bootstrapValidator/dist/css/bootstrapValidator.css',
                    'public/bower_dependencies/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
                    'public/bower_dependencies/76d-social-icons/assets/css/social-icons.css',
                    'public/bower_dependencies/76d-social-icons/assets/css/main.css',
                    'public/css/main.css'
                ],
                "dest": 'public/css/combined.css'
            }
        },
        "uglify": {
            "options": {
                sourceMap: false
            },
            "js": {
                "files": {
                    'public/js/combined.min.js': [
                        'public/bower_dependencies/jquery/jquery.js',
                        'public/bower_dependencies/bootstrap/dist/js/bootstrap.js',
                        'public/bower_dependencies/bootstrapValidator/dist/js/bootstrapValidator.js',
                        'public/bower_dependencies/bootbox/bootbox.js',
                        'public/bower_dependencies/underscore/underscore.js',
                        'public/bower_dependencies/moment/moment.js',
                        'public/bower_dependencies/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                        'public/js/app/common.js',
                        'public/js/lib/bootstrap3-typeahead.js',
                        'public/js/lib/bloodhound.js',
                        'public/js/app/jquery.card.js'
                    ]
                }
            }
        },
        "cssmin": {
            "css": {
                "src": 'public/css/combined.css',
                "dest": 'public/css/combined.min.css'
            }
        },
        "typescript": {
            "coral": {
                "src": ['app.ts'],
                "options": {
                    "module": 'commonjs', //or commonjs
                    "target": 'es5', //or es3
                    "basePath": '.',
                    "sourceMap": false,
                    "declaration": false
                }
            }
        },
        "clean": {
            "options": {
                "force": true
            },
            "typescript": ["app.js", "*/**/*.js", "!Gruntfile.js", "!public/**/*.js", "!node_modules/**/*.js", "!common/Config.js"],
            "release": "/var/searchntalk/releases/current"
        },
        "bumpup": {
            "files": ["package.json", "bower.json"]
        },
        "prompt": {
            "bumpup": {
                "options": {
                    "questions": [
                        {
                            "config": "bumpup.type",
                            "type": "list",
                            "message": "How do you want to bump up the version number for this release?",
                            "default": "patch",
                            "choices": [
                                { "name": "patch", "checked": true },
                                { "name": "major"},
                                { "name": "minor" },
                                { "name": "prerelease" },
                                { "name": "build" },
                            ]
                        }
                    ]
                }
            }
        },
        "prompt_bumpup": {
            "target": {

            }
        },
        "gitcommit": {
            "bumpup": {
                "message": "Released and bumped up project version",
                "files": {
                    "src": ["package.json", "bower.json"]
                }
            }
        },
        "gitpush": {
            "bumpup": {}
        },
        "create-alter-script": {
            "target": {
            }
        },
        "update-db": {
            "originalDb": {
                "db": Config.get(Config.DATABASE_NAME)
            },
            "refDb": {
                "db": Config.get(Config.REF_DATABASE_NAME)
            }
        },
        "sync-changeLog": {
            "target": {

            }
        },
        "watch": {
            "typescript": {
                "files": ["*/**/*.ts", "!node_modules/*/*"],
                "tasks": ["typescript"]
            }
        },
        "replace": {
            "asset_version": {
                "src": "views/header.jade",
                "overwrite": true,
                "replacements": [{
                        "from": "v=version",
                        "to": "v=<%= pkg.version %>&seed=" + Math.floor(Math.random() * 1000)
                    }]
            }
        }
    });

    grunt.registerMultiTask("prompt_bumpup", function ()
    {
        grunt.task.run("bumpup:" + grunt.config("bumpup.type"));
    });

    grunt.registerMultiTask("create-alter-script", function ()
    {
        var dbUsername = Config.get(Config.DATABASE_USER);
        var dbPassword = Config.get(Config.DATABASE_PASS);
        var dbname = Config.get(Config.DATABASE_NAME);
        var refDbname = Config.get(Config.REF_DATABASE_NAME);

        var command = 'java -jar sql/liquibase.jar --classpath=sql/mysql-connector-java-5.1.30-bin.jar ' +
            '--changeLogFile=sql/changelog.xml --url="jdbc:mysql://localhost/' + refDbname + '" --username=' + dbUsername + ' --password=' + dbPassword + ' diffChangeLog ' +
            '--referenceUrl=jdbc:mysql://localhost/' + dbname + ' --referenceUsername=' + dbUsername + ' --referencePassword=' + dbPassword;

        //in command, original db is used in reference as liquibase generate changeSet to convert db specified in url to db specified in refUrl

        var exec = childProcess.exec;

        console.log(command);
        var done = this.async();
        exec(command, function (error, stdout, stderr)
        {
            console.log("Change Log generated");
            console.log(stdout);
            console.log(stderr);
            done();
        });
    });

    grunt.registerMultiTask('update-db', function ()
    {
        var dbName = this.data.db;
        var dbUsername = Config.get(Config.DATABASE_USER);
        var dbPassword = Config.get(Config.DATABASE_PASS);

        var command = 'java -jar sql/liquibase.jar --classpath=sql/mysql-connector-java-5.1.30-bin.jar ' +
            '--changeLogFile=sql/changelog.xml --url="jdbc:mysql://localhost/' + dbName + '" --username=' + dbUsername + ' --password=' + dbPassword + ' update';

        var exec = childProcess.exec;

        console.log(command);
        var done = this.async();
        exec(command, function (error, stdout, stderr)
        {
            console.log(dbName + " updated");
            console.log(stdout);
            console.log(stderr);
            done();
        });
    });

    /* Custom Task - changeLongSync for liquibase to apply generated change set to source database after generating changeset */
    grunt.registerMultiTask('sync-changeLog', function ()
    {
        var dbName = Config.get(Config.DATABASE_NAME);
        var dbUsername = Config.get(Config.DATABASE_USER);
        var dbPassword = Config.get(Config.DATABASE_PASS);

        var command = 'java -jar sql/liquibase.jar --classpath=sql/mysql-connector-java-5.1.30-bin.jar ' +
            '--changeLogFile=sql/changelog.xml --url="jdbc:mysql://localhost/' + dbName + '" --username=' + dbUsername + ' --password=' + dbPassword + ' changeLogSync';

        var exec = childProcess.exec;

        console.log(command);
        var done = this.async();
        exec(command, function (error, stdout, stderr)
        {
            console.log("Change Log Synced");
            console.log(stdout);
            console.log(stderr);
            done();
        });
    });

    grunt.registerTask('generate-change-set', ['create-alter-script', 'update-db:refDb:db', 'sync-changeLog']);

    grunt.registerTask('process-assets', ['uglify:js', 'concat:css', 'cssmin:css']);
    grunt.registerTask('release', ["clean:typescript", "typescript:coral", "prompt:bumpup", "prompt_bumpup", "rename:release", "copy:release", "clean:release", "symlink:release", "db_dump:release", "update-db:originalDb", "gitcommit:bumpup", "gitpush:bumpup"]);

}

export = init;