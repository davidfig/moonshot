const esbuild = require('esbuild')
const chokidar = require('chokidar')
const express = require('express')
const fs = require('fs-extra')

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

async function build() {
    await esbuild.build({
        entryPoints: ['code/default.js'],
        bundle: true,
        sourcemap: false,
        outfile: 'www/index.js',
    })
    const now = new Date()
    console.log(`[${now.toLocaleString()}] compiled index.js`)
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
        try {
            await fs.unlink('www/index.js.map')
        } catch(e) {}
        build()
    } else {
        watch()
        serve()
    }
}

start()