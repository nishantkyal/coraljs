"use strict";
function init(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-bump');
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
                src: ['enums/*.d.ts', 'models/*.d.ts', 'dao/*.d.ts', 'delegates/*.d.ts', 'common/*.d.ts', 'caches/*.d.ts', 'api/*.d.ts', 'decorators/*.d.ts'],
                dest: 'index.d.ts'
            },
            'coral-banner': {
                src: ["index.d.ts"],
                dest: 'index.d.ts',
                options: {
                    banner: "declare module 'coraljs'\n{\nimport solr_client = require('solr-client');\nimport mysql = require('mysql');\nimport log4js = require('log4js');\nimport redis = require('redis');\nimport express = require('express');\n\n",
                    footer: '}'
                }
            }
        },
        replace: {
            'coral-ts': {
                src: ['index.d.ts'],
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
                        from: /import[^\n]*;/g,
                        to: ''
                    }
                ]
            }
        },
        "ts": {
            "server": {
                src: ['enums/*.ts', 'models/*.ts', 'dao/*.ts', 'delegates/*.ts', 'common/*.ts', 'caches/*.ts', 'api/*.ts', 'decorators/*.ts'],
                "options": {
                    "module": "commonjs",
                    "target": "es2016",
                    "lib": ["es2016"],
                    sourceMap: true,
                    declaration: true,
                    experimentalDecorators: true
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
        }
    });
    grunt.registerTask('default', ['clean', 'ts:server', 'concat:coral', 'replace', 'concat:coral-banner']);
}
module.exports = init;
//# sourceMappingURL=Gruntfile.js.map