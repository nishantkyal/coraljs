/*
 * grunt-promise-q
 * https://github.com/ogre/grunt-promise-q
 *
 * Copyright (c) 2013 Oleg Grenrus
 * Licensed under the BSD3 license.
 */

"use strict";

var q = require("q");

function register(grunt, name, description, f) {
    grunt.registerTask(name, description, function () {
        var that = this;
        var done = this.async();

        f.call(that).then(
            function () { done(true); },
            function (err) {
                grunt.log.warn(err);
                done(false);
            }
        )
        .done();
    });
}

function registerMulti(grunt, name, description, f) {
    grunt.registerMultiTask(name, description, function () {
        var that = this;
        var done = this.async();

        f.call(that)
        .then(function () { done(true); })
        .catch(function (err) {
                grunt.log.warn(err);
                done(false);
            }
        )
        .done();
    });
}

module.exports = {
    register: register,
    registerMulti: registerMulti,
};
