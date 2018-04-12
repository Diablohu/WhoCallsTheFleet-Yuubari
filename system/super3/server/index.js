if (__DEV__) console.log('∞ Server initializing...')

import cookie from 'cookie'

//

import Koa from 'koa'
import koaStatic from 'koa-static'
import convert from 'koa-convert'

//

import { register as i18nRegister } from 'sp-i18n'
import i18nOnServerRender from 'sp-i18n/onServerRender'

//

import getValue from './get-value'
import { CHANGE_LANGUAGE, TELL_CLIENT_URL, SERVER_REDUCER_NAME, serverReducer } from '../server-redux'





export default async (config) => {
    const {
        name,
        dir,
        locales,
    } = config
    const i18n = Array.isArray(locales)




    // ============================================================================
    // 载入目录、相关配置、自定模块等
    // ============================================================================
    const reactApp = require('../client')(config)
    // const {
    //     pathNameDistWeb: distPathname,
    //     pathNameSub: appName
    // } = require('../config/site')
    // const rootPath = process.cwd() + '/' + distPathname + '/public'




    // ============================================================================
    // 对应client的server端处理
    // ============================================================================

    if (i18n) {
        const availableLocales = []
        const localesObj = {}
        locales.forEach(o => {
            const [localeId, localeFilePath] = o
            availableLocales.push(localeId)
            localesObj[localeId] = getValue(dir, localeFilePath)
        })
        // 服务器端注册多语言
        i18nRegister(availableLocales, locales)
    }




    // ============================================================================
    // callback: before run
    // ============================================================================
    let beforeRun = getValue(dir, config.server.beforeRun)
    if (typeof beforeRun === 'function') {
        await beforeRun()
    }




    // ============================================================================
    // 创建KOA实例
    // ============================================================================
    const app = new Koa()

    /* 扩展服务端特色处理的redux */
    reactApp.redux.reducer.use(SERVER_REDUCER_NAME, serverReducer)

    /* 静态目录,用于外界访问打包好的静态文件js、css等 */
    app.use(convert(koaStatic(
        rootPath,
        {
            maxage: 0,
            hidden: true,
            index: 'index.html',
            defer: false,
            gzip: true,
            extensions: false
        }
    )))




    // ============================================================================
    // 同构配置
    // ============================================================================

    const isomorphic = reactApp.isomorphic.createKoaMiddleware({

        // react-router 配置对象
        routes: reactApp.react.router.get(),

        // redux store 对象
        configStore: reactApp.createConfigureStoreFactory(),

        // HTML基础模板
        template,

        // 对HTML基础模板的自定义注入
        // 例如：<script>//inject_critical</script>  替换为 critical
        inject: {
            // htmlattr: () => ` data-locale="${currentLocaleId}" lang="${currentLocaleId}"`,
            // manifest: () => {
            //     const filename = `manifest-${currentLocaleId}.json`
            //     const { mtime } = __DEV__ ? '' : fs.statSync(path.join(rootPath, filename))
            //     return `<link rel="manifest" href="/${filename}?${mtime ? mtime.valueOf() : ''}">`
            // },
            // svg_symbols: (() => {
            //     const content = fs.readFileSync(
            //         path.resolve(dirs.assets, './symbols/symbol-defs.svg'),
            //         'utf8'
            //     )
            //         .replace(/<title>(.+?)<\/title>/g, '')
            //         .replace(/\n/g, '')

            //     return `<div class="hide">${content}</div>`
            //         + (__DEV__ ? `<script>var __ICONSVG__ = \`${content}\`</script>` : '')
            // }),

            // critical_css: (() => __DEV__
            //     ? ''
            //     : `<style type="text/css">${getFileContent('critical.css')}</style>`
            // )(),

            // critical_extra_old_ie_filename: `<script>var __CRITICAL_EXTRA_OLD_IE_FILENAME__ = "${getFile('critical-extra-old-ie.js')}"</script>`,
            // // client_filename: `<script>var __CLIENT_FILENAME__ = "${getFile('client.js')}"</script>`,
            // // js: (() => ([
            // //     getFile('client.js')
            // // ]))(),
            // // css: [],
            // serviceworker_path: __DEV__ ? '' : getServiceWorkerFile(`service-worker.${appName}.js`, distPathname),
            // // pwa: __DEV__ ? '' : injectPWA('service-worker.app.js')

            // scripts: (() => {
            //     let html = ''
            //     const scripts = (__DEV__ ? [] : ['commons.js'])
            //         .concat(['client.js'])

            //     if (__DEV__) html += `<script type="text/javascript" src="${getFile('critical.js')}"></script>`
            //     else html += `<script type="text/javascript">${getFileContent('critical.js')}</script>`

            //     scripts.forEach(filename => {
            //         html += `<script type="text/javascript" src="${getFile(filename)}" onerror="onInitError()" defer></script>`
            //     })

            //     return html
            // })(),
        },

        onServerRender: (obj) => {
            // if (__DEV__) {
            //     console.log(' ')
            //     console.log('[SERVER] onRender')
            // }

            let { koaCtx, reduxStore } = obj

            let lang = (() => {

                // 先查看URL参数是否有语音设置
                // hl 这个参数名是参考了Instargram
                let lang = koaCtx.query.hl

                // 如果没有，检查cookie
                const cookies = cookie.parse(koaCtx.request.header.cookie || '')
                if (!lang && cookies.spLocaleId && cookies.spLocaleId !== 'null')
                    lang = cookies.spLocaleId

                // 如果没有，再看header里是否有语言设置
                if (!lang)
                    lang = koaCtx.header['accept-language']

                // 如没有，再用默认
                if (!lang)
                    lang = 'en'

                return lang
            })()

            reduxStore.dispatch({ type: CHANGE_LANGUAGE, data: lang })
            reduxStore.dispatch({ type: TELL_CLIENT_URL, data: koaCtx.origin })

            i18nOnServerRender(obj)
            // dbUpdateLocale()
        }
    })

    app.use(async (ctx, next) => {
        if (!__DEV__) __webpack_public_path__ = `/${name}/` // TODO: 移动到配置里
        await next()
    })

    app.use(isomorphic)

    // if (__DEV__) console.log('✔ Server inited.')

    return app
}
