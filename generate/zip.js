const archiver = require('archiver')
const fs = require('fs-extra')

/**
 * from https://stackoverflow.com/a/51518100/1955997
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
    const archive = archiver('zip', { zlib: { level: 9 }});
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        archive
            .directory(source, false)
            .on('error', err => reject(err))
            .pipe(stream)
        ;

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

async function start() {
    await zipDirectory('www', 'shoot-the-moon.zip')
    console.log('generated shoot-the-moon.zip')
    process.exit(0)
}

start()