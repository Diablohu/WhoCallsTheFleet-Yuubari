const path = require('path');
const fs = require('fs-extra');

const {
    bgimgs: pathBgimgs,
    // nodeModules: pathNodeModules,
    assets: pathAssets,
    src: { ui: pathUI },
} = require('./directories');

// ============================================================================

const defines = {
    __CHANNEL__: JSON.stringify(require('./channel')),

    __BGIMG_LIST__: JSON.stringify(
        fs
            .readdirSync(pathBgimgs)
            .filter(
                (file) =>
                    !fs
                        .lstatSync(path.resolve(pathBgimgs, file))
                        .isDirectory() &&
                    path.extname(path.resolve(pathBgimgs, file)) === '.jpg'
            )
    ),

    // __SWIPER_CSS__: JSON.stringify(
    //     fs.readFileSync(
    //         path.resolve(pathNodeModules, 'swiper/dist/css/swiper.min.css'),
    //         'utf-8'
    //     )
    // ),

    __SVG_SYMBOLS__: JSON.stringify(
        fs
            .readFileSync(
                path.resolve(pathAssets, './symbols/symbol-defs.svg'),
                'utf8'
            )
            .replace(/<title>(.+?)<\/title>/g, '')
            .replace(/\n/g, '')
    ),

    __DEV_COMPONENTS_ROUTES__: JSON.stringify(
        (() => {
            const dir = path.resolve(pathUI, 'pages/dev/components');
            return fs
                .readdirSync(dir)
                .filter((filename) =>
                    fs.lstatSync(path.resolve(dir, filename)).isDirectory()
                )
                .map((dirname) => ({
                    name: dirname.replace(/／/g, '/'),
                    path: dirname.replace(/／/g, '-'),
                    dirname,
                }));
        })()
    ),
};

// ============================================================================

module.exports = defines;
