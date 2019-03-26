var browserify = require('browserify');
var watchify = require('watchify');
var tsify = require('tsify');
var path = require('path');
var fs = require('fs');

var files = fs.readdirSync(__dirname);
for (var file of files) {
    if (path.extname(file) === '.ts') {
        listenForChangesToFile(file);
    }
}

function listenForChangesToFile(filename) {
    var b = browserify({
        cache: {},
        packageCache: {},
    });

    var newFilename = path.join(__dirname, 'public/build', path.basename(filename, '.ts') + '.js');

    b.plugin(tsify);
    b.plugin(watchify);
    b.add(filename);
    b.on('update', () => {
        bundle(b, newFilename);
    });
    bundle(b, newFilename);
}

function bundle(b, newFilename) {
    b.bundle().on('error', () => {}).pipe(fs.createWriteStream(newFilename));
}

function changeExt(filename, newExt) {
    var pos = filename.lastIndexOf(".");
    return filename.substr(0, pos < 0 ? filename.length : pos) + newExt;
}