const esbuild = require('esbuild')
const chokidar = require('chokidar')
const express = require('express')
const fs = require('fs-extra')

const packageJson = require('../package.json')

const port = 8888

async function compile() {
    await esbuild.build({
        entryPoints: ['code/default.js'],
        bundle: true,
        sourcemap: true,
        outfile: 'www/index.js',
    })
    const now = new Date()
    console.log(`[${now.toLocaleString()}] compiled index.js`)
}

async function html() {
    const s = '<!DOCTYPE html><html><head><meta charset="utf-8" />' +
    '<link rel="stylesheet" type="text/css" href="index.css" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">' +
    '<meta name="apple-mobile-web-app-capable" content="yes">' +
    '<meta name="apple-mobile-web-app-title" content="Shoot the Moon">' +
    '<title>Shoot the Moon</title>' +
    `<script src="index.${packageJson.version}.js"></script>` +
    '</head><body><canvas class="view"></canvas></body></html>'
    await fs.outputFile('public/index.html', s)
}

async function build() {
    await esbuild.build({
        entryPoints: ['code/default.js'],
        bundle: true,
        sourcemap: false,
        outfile: `public/index.${packageJson.version}.js`,
        minify: true,
    })
    const now = new Date()
    console.log(`[${now.toLocaleString()}] compiled index.${packageJson.version}.js`)
    html()
}

function watch() {
    compile()
    const watcher = chokidar.watch('code/**/*.js')
    watcher.on('change', compile)
}

function serve() {
    const app = express()
    app.use(express.static('www'))
    app.listen(port)
    console.log(`Shoot the Moon (like literally) - debug server running at http://localhost:${port}...`)
}

async function start() {
    if (process.argv[2] === '--production') {
        console.log('Building Shoot the Moon (like literally) for production...')
        await fs.emptyDir('public')
        await fs.copy('www/index.css', 'public/index.css')
        build()
    } else {
        watch()
        serve()
    }
}

start()