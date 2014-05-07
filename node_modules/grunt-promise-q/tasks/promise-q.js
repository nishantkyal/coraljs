"use strict";

var asyncTask = require("../lib/grunt-promise-q.js");
var q = require("q");
var fs = require("q-io/fs");
var path = require("path");

module.exports = function (grunt) {
    asyncTask.registerMulti(grunt, "promiseq", "promise q test task", function () {
        var options = this.options({
            punctuation: ".",
            separator: ", ",
        });

        var ps = this.files.map(function (f) {
            return q.all(f.src.map(function (f_src) {
                return fs.exists(f_src).then(function (ex) {
                    if (ex) {
                        return f_src;
                    } else {
                        return undefined;
                    }
                });
            }))
            .then(function (filtered) {
                filtered = filtered.filter(function (f_src) {
                    return f_src !== undefined;
                });

                return q.all(filtered.map(function (f) {
                    return fs.read(f);
                }));
            })
            .then(function (contents) {
                var src = contents.join(grunt.util.normalizelf(options.separator));
                src += options.punctuation;

                console.log(f.dest, src);

                return fs.makeTree(path.dirname(f.dest))
                    .then(function () {
                        return fs.write(f.dest, src);
                    });
            })
            .then(function () {
                grunt.log.writeln("File '" + f.dest + "' created.");
            });
        });

        return q.all(ps);
    });
};
