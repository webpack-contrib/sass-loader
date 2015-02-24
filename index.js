
'use strict';

var utils = require('loader-utils');
var sass = require('node-sass');
var path = require('path');
var _ = require('lodash');

function split(str) {
    var idx = str.lastIndexOf("!");
    return idx < 0 ? ['', str] : [str.substr(0, idx+1), str.substr(idx+1)];
}

var UnsafeCachePlugin = require("enhanced-resolve/lib/UnsafeCachePlugin");

var ModulesInRootPlugin = require("enhanced-resolve/lib/ModulesInRootPlugin");
var ModuleAsFilePlugin = require("enhanced-resolve/lib/ModuleAsFilePlugin");
var ModuleAsDirectoryPlugin = require("enhanced-resolve/lib/ModuleAsDirectoryPlugin");
var ModuleAliasPlugin = require("enhanced-resolve/lib/ModuleAliasPlugin");
var DirectoryDefaultFilePlugin = require("enhanced-resolve/lib/DirectoryDefaultFilePlugin");
var DirectoryDescriptionFilePlugin = require("enhanced-resolve/lib/DirectoryDescriptionFilePlugin");
var DirectoryDescriptionFileFieldAliasPlugin = require("enhanced-resolve/lib/DirectoryDescriptionFileFieldAliasPlugin");
var FileAppendPlugin = require("enhanced-resolve/lib/FileAppendPlugin");
var DirectoryResultPlugin = require("enhanced-resolve/lib/DirectoryResultPlugin");
var ResultSymlinkPlugin = require("enhanced-resolve/lib/ResultSymlinkPlugin");

var Resolver = require("enhanced-resolve/lib/Resolver");

function makeRootPlugin(name, root) {
    if(typeof root === "string") {
        return new ModulesInRootPlugin(name, root);
    } else if(Array.isArray(root)) {
        return function() {
            root.forEach(function(root) {
                this.apply(new ModulesInRootPlugin(name, root));
            }, this);
        }
    }
    return function() {};
}

module.exports = function (content) {

    this.cacheable();
    var callback = this.async();
    var self = this;

    function importer(url, prev, callback) {

        var parts = split(url),
            loaders = parts[0],
            filename = parts[1],
            mod;

        var resolver = new Resolver(null);

        // lol this.
        // Waiting on https://github.com/webpack/webpack/pull/732
        resolver.fileSystem = require('fs');

        resolver.apply(
            makeRootPlugin("module", path.dirname(prev)),
            makeRootPlugin("module", self.context),
            makeRootPlugin("module", self.options.resolve.root),
            new ModuleAsFilePlugin("module"),
            new ModuleAsDirectoryPlugin("module"),
            new DirectoryDefaultFilePlugin(["index"]),
            new FileAppendPlugin([ '.scss', '.sass' ]),
            new ResultSymlinkPlugin()
        );

        function resolveFinish(err, resolved) {
            if (err) {
                callback(err);
                return;
            }

            var url = loaders + resolved;
            var k = '!!' +__dirname+'/stringify.loader.js!' + url;

            self.loadModule(k, function(err, data, map, mod) {
                if (err) {
                    callback(err);
                    return;
                }

                self.dependency(resolved);

                // Why this doesn't take an explicit err argument is beyond me.
                callback({
                    contents: data && JSON.parse(data),
                    file: resolved
                });
            });
        }

        mod = path.join(path.dirname(filename), '_' + path.basename(filename));

        // Try for normal version first, then _ version
        resolver.resolve(self.context, filename, function(err, resolved) {
            if (err) {
                resolver.resolve(self.context, mod, resolveFinish);
            } else {
                resolveFinish(err, resolved);
            }

        });
    };

    sass.render(_.assign({
        file: this.resourcePath,
        data: content,
        importer: importer,
        outputStyle: 'compressed',
        error: function (err) {
            callback(err);
        },
        success: function (result) {
            callback(null, result.css, result.map);
        }
    }, utils.parseQuery(this.query)));
};
