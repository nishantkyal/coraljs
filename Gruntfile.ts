///<reference path='./_references.d.ts'/>
import q                                                    = require('q');
import childProcess                                         = require('child_process');
import Config                                               = require('./common/Config');

function init(grunt)
{
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
                    module: 'commonjs', //or commonjs
                    target: 'es5', //or es3
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
                                { name: 'major'},
                                { name: 'minor' },
                                { name: 'prerelease' },
                                { name: 'build' },
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
                    'src': ['package.json', 'bower.json']
                }
            }
        },
        "gitpush": {
            "bumpup": {}
        },
        'create-alter-script': {
            target: {

            }
        },
        'update-db': {
            originalDb: {
                db: Config.get(Config.DATABASE_NAME)
            },
            refDb: {
                db: Config.get(Config.REF_DATABASE_NAME)
            }
        },
        'sync-changeLog': {
            target: {

            }
        }
    });

    grunt.registerMultiTask('prompt_bumpup', function ()
    {
        grunt.task.run('bumpup:' + grunt.config('bumpup.type'));
    });

    grunt.registerMultiTask('create-alter-script', function ()
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

    /*grunt.registerMultiTask('update-master-data', function ()
    {
        var dbName = this.data.db;
        var dbUsername = Config.get(Config.DATABASE_USER);
        var dbPassword = Config.get(Config.DATABASE_PASS);

        var command = 'java -jar sql/liquibase.jar --classpath=sql/mysql-connector-java-5.1.30-bin.jar ' +
            '--changeLogFile=sql/ref_data.changelog.xml --url="jdbc:mysql://localhost/' + dbName + '" --username=' + dbUsername + ' --password=' + dbPassword + ' update';

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
    });*/

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

    grunt.registerTask('default', ['concat:js', 'concat:css', 'cssmin:css']);
    grunt.registerTask('release', ['clean:typescript', 'typescript:coral', 'prompt:bumpup', 'prompt_bumpup', "gitcommit:bumpup", "gitpush:bumpup"]);

}

export = init;