"use strict";

var _ = require('lodash');
var fs = require('fs');
var path = require('path');


var PLUGIN_NAME = 'BundleHashWebpackPlugin';
var OPTIONS_DEFAULT = {

    lineEnding: '\n',
    encoding: 'utf8',
    prefix: 'chunk',

    helpers: {
        'js': require('./helpers/javascript'),
        'css': require('./helpers/css')
    }

};


function BundleHashWebpackPlugin(options) {
    this.pluginOptions = _.merge({}, OPTIONS_DEFAULT, options || {});
}


BundleHashWebpackPlugin.prototype.apply = function(compiler) {
    var _this = this;

    compiler.plugin("done", function (stats) {
        _this._handleFiles(_this.pluginOptions, stats);
    });
};


BundleHashWebpackPlugin.prototype._handleFiles = function (options, stats) {
    var _this = this;

    var fileProperty = options.file;
    var pluginOptions = _.omit(options, 'file');

    console.log(PLUGIN_NAME, '... start');

    if (_.isArray(fileProperty)) {
        fileProperty.forEach(function (fileOptions) {
            _this._handleFile(_.merge({}, pluginOptions, fileOptions), stats);
        });
    }
    else if (_.isObject(fileProperty)){
        _this._handleFile(_.merge({}, pluginOptions, fileProperty), stats);
    }
    else {
        console.error(PLUGIN_NAME, 'No files to handle!');
    }

    console.log(PLUGIN_NAME, '... done');
};


BundleHashWebpackPlugin.prototype._handleFile = function (options, stats) {
    var validateError = this._validateFileOptions(options);
    if (validateError) {
        console.warn(PLUGIN_NAME, 'ERROR', validateError, 'File ignored.');
        return;
    }

    var assetsStats = stats.toJson();
    var mountPoints = this._getHtmlBlocksByAssetsStats(options, assetsStats);

    var htmlTemplate = this._fetchTemplateContent(options.template, options.encoding);

    if (htmlTemplate) {
        var htmlContent = this._renderTemplate(htmlTemplate, mountPoints, options);

        this._saveContentToFile(options.target, htmlContent, options.encoding);
    }

};


BundleHashWebpackPlugin.prototype._validateFileOptions = function (options) {

    if (!options.template) {
        return 'Template file path must be defined.';
    }

    if (!options.target) {
        return 'Target file path must be defined.';
    }

    if (options.template == options.target) {
        return 'Template and target path must be different.';
    }

    return null;
};


BundleHashWebpackPlugin.prototype._getHtmlBlocksByAssetsStats = function (options, assetsStats) {
    var publicPath = assetsStats.publicPath || '';
    var assetsByChunkName = assetsStats.assetsByChunkName;
    var chunkNames = Object.keys(assetsByChunkName);

    return chunkNames.reduce(function (result, chunkName) {
        var chunk = assetsByChunkName[chunkName];

        (_.isArray(chunk) ? chunk : [chunk]).forEach(function (fileName) {
            var ext = path.extname(fileName).replace(/^\./, '');
            var key = [options.prefix, chunkName, ext].join('_');

            if (_.isFunction(options.helpers[ext])) {

                if (!result[key]) {
                    result[key] = [];
                }

                result[key].push(options.helpers[ext](publicPath + fileName));
            }
        });

        return result;
    }, {});

};


BundleHashWebpackPlugin.prototype._renderTemplate = function (htmlTemplate, mountPoints, options) {
    var htmlContent = htmlTemplate;

    for (var mountPoint in mountPoints) if (mountPoints.hasOwnProperty(mountPoint)) {

        var mountPointStr = ['<!-- ?', mountPoint, ' ?-->(.|\n|\r)*<!-- ?/', mountPoint, ' ?-->'].join('');
        var mountPointRegExp = new RegExp(mountPointStr, 'gi');

        var isPresentInTemplate = mountPointRegExp.test(htmlTemplate);

        if (isPresentInTemplate) {
            htmlContent = htmlContent.replace(mountPointRegExp, mountPoints[mountPoint].join(options.lineEnding));
        } else {
            console.warn(
                PLUGIN_NAME,
                'WARNING',
                'Expected mountpoint `' + mountPoint + '` in the template file `'+ options.template + '` but is absent'
            );
        }
    }

    return htmlContent;
};


BundleHashWebpackPlugin.prototype._fetchTemplateContent = function (fileName, encoding) {
    var content;

    try {
        content = fs.readFileSync(fileName, { encoding : encoding});
    } catch (e) {
        console.error(PLUGIN_NAME, 'ERROR', e);
        return null;
    }

    return content;
};


BundleHashWebpackPlugin.prototype._saveContentToFile = function (fileName, content, encoding) {
    try {
        fs.writeFileSync(fileName, content, { encoding : encoding});
        console.log(PLUGIN_NAME, 'INFO', 'Target file created: `' + fileName + '`');
    } catch (e) {
        console.error(PLUGIN_NAME, 'ERROR', e);
        return false;
    }

    return true;
};


module.exports = BundleHashWebpackPlugin;
