# Bundle Hash Webpack Plugin

This is a [webpack](http://webpack.github.io/) plugin helps to create static HTML files with hashed bundle names in the build directory.

**IMPORTANT!** Only for production build. Do not use with [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html)!

### Install
`
npm install --save-dev bundlehash-webpack-plugin
`

### Usage
Plugin take static HTML file as template and replace 

`'<!-- [prefix]_[chunk_name]_[extension] --><!-- /[prefix]_[chunk_name]_[extension] -->'`

blocks to hashed chunks.

####Simple usage:
Webpack production config:
```javascript
module.exports = {

    entry:  {
        app: './src/app' // <- Chink name is `app`
    },

    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: 'js/[name].bundle.[hash].js' // <- Bundle file name contain hash part
    },

    plugins: [
        new BundleHashWebpackPlugin({
            file: {
                template: path.join(__dirname, 'static/index.html'),
                target: path.join(__dirname, 'dist/index.html')
            }
        })
    ]    
}
```

File `'static/index.html'` as template:
```html
<!DOCTYPE html>
<html class='default' dir='ltr'>
  <head>
    <meta charset='UTF-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=Edge,chrome=1' />
    <title>App Title</title>

    <!-- chunk_app_css -->
    <!-- /chunk_app_css -->
  </head>
  <body class='fade-out' data-version='1'>
    <div id='app-container'></div>
  </body>

  <!-- chunk_app_js -->
  <script src="/js/app.bundle.js"></script> <!-- this is develop mode bundle -->
  <!-- /chunk_app_js -->
</html>
```

File `'dist/index.html'` as result target file:
```html
<!DOCTYPE html>
<html class='default' dir='ltr'>
  <head>
    <meta charset='UTF-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=Edge,chrome=1' />
    <title>App Title</title>
    <link rel="stylesheet" media="all" href="/css/app.bundle.893f4a1de32c17e9bad5.css" />
  </head>
  <body class='fade-out' data-version='1'>
    <div id='app-container'></div>
  </body>

  <script src="/js/app.bundle.893f4a1de32c17e9bad5.js"></script>
</html>
```

####Multiple files:
```javascript
plugins: [
    new BundleHashWebpackPlugin({
        file: [
        {
            template: path.join(__dirname, 'static/index.html'),
            target: path.join(__dirname, 'dist/index.html')
        },
        {
            template: path.join(__dirname, 'static/about.html'),
            target: path.join(__dirname, 'dist/about.html')
        }
        ]
    })
]    
```

####Advanced usage:
```javascript
plugins: [
    new BundleHashWebpackPlugin({
        lineEnding: '\n',
        encoding: 'utf8',
        prefix: 'chunk',

        helpers: {
            'css': function (path) { 
                return '<link rel="stylesheet" media="all" href="' + path + '" />'
            },
            'js': function (path) { 
                return '<script src="' + path + '"></script>'
            }
        }
    
        file: [
            {
                template: path.join(__dirname, 'static/index.html'),
                target: path.join(__dirname, 'dist/index.html')
            },
            {
                lineEnding: '\r\n',
                prefix: 'chunk_file',

                helpers: {
                    'js': function (path) { 
                        return '<script type="text/javascript" src="' + path + '" defer></script>'
                    }
                },

                template: path.join(__dirname, 'static/about.html'),
                target: path.join(__dirname, 'dist/about.html')
            }
        ]
    })
]    
```

### Options properties:
* `lineEnding`
    - is optional
    - defaults is `'\n'`
    - can be a glob
    - can be overwritten in `'file'` property level
    - define line ending between html blocks
* `encoding`
    - is optional
    - defaults is `'utf8'`
    - can be a glob
    - can be overwritten in `'file'` property level
    - define encoding used to open the template and target files
* `prefix`
    - is optional
    - defaults is `'chunk'`
    - can be a glob
    - can be overwritten in `'file'` property level
    - define fist part of name of chunk files mount point: `'<!-- [prefix]_app_js --><!-- /[prefix]_app_js -->'` 
* `helpers`
    - is optional
    - defaults is contain templates for `'js'` and `'css'` chunks. 
      See `'helpers'` in (Advanced usage)[https://github.com/wearevolt/bundlehash-webpack-plugin#advanced-usage] section. 
    - can be a glob
    - can be overwritten in `'file'` property level
    - define template for chunk file extension    
* `file`
    - is required
    - can be a object or array of objects
    - it can only be global
    - define a object of describing the properties of a file (see `'template'` and `'target'` properties)
* `template`
    - is required
    - it can only be in `'file'` level
    - can be path relative to the template file
* `target`
    - is required
    - it can only be in `'file'` level
    - can be path relative to the target file

### Issues

Have a bug? Please create an issue here on GitHub!

[https://github.com/wearevolt/bundlehash-webpack-plugin/issues](https://github.com/wearevolt/bundlehash-webpack-plugin/issues)

### License

MIT