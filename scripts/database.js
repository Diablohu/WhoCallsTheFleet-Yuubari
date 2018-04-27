const LZString = require('lz-string')
const path = require('path')
const fs = require('fs-extra')

const {
    src: {
        _: pathApp
    },
} = require('../src/directories')

const dbpath = path.resolve(process.cwd(), 'node_modules', 'whocallsthefleet-database', 'db')
const topath = path.resolve(pathApp, 'client', 'logic', 'database', 'db')

module.exports = async () => {
    console.log('\nCompressing database...')

    // ensure and empty target dir
    fs.ensureDirSync(topath)
    fs.emptyDirSync(topath)

    fs.readdirSync(dbpath).forEach(file => {
        let content = fs.readFileSync(path.resolve(dbpath, file), 'utf8')
        switch (file) {
            case 'entities.nedb':
                content = content.split(/\r?\n/)
                    .filter(line => typeof line !== 'undefined' && line)
                    .map(line => {
                        const json = JSON.parse(line)
                        delete (json.picture)
                        return JSON.stringify(json)
                    })
                    .join("\n") + "\r"
                // fs.writeFile(
                //     path.resolve(topath, file + '.test'),
                //     content,
                //     'utf-8'
                // )
                break
        }
        fs.writeFile(
            path.resolve(topath, file),
            LZString.compressToEncodedURIComponent(content),
            'utf-8'
        )
        console.log('  > ' + file)
    })

    console.log('  > COMPLETE')

    console.log('\nCreating collections...')
    await require('./database/ship-collections.js')(dbpath, topath)
    await require('./database/equipment-collections.js')(dbpath, topath)
}

// run()
