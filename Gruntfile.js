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
                src: ['ts/enums/*.d.ts', 'ts/models/*.d.ts', 'ts/delegates/ApiUrlDelegate.d.ts', 'ts/common/*.d.ts'],
                dest: 'Coral.d.ts'
            }
        },
        replace: {
            coral: {
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
        },
        ts: {
            dev: {
                src: ['**/*.ts', '*.ts'],
                reference: 'Coral.d.ts',
                outDir: 'ts',
                options: {
                    module: 'commonjs',
                    declaration: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.registerTask('default', ['clean', 'concat', 'replace']);
};