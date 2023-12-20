import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import zhHant from './languages/zh-hant.json'
import zhHans from './languages/zh-hans.json'

const systemLang = Intl.DateTimeFormat().resolvedOptions().locale
let lang
switch (systemLang) {
    case 'zh-TW':
    case 'zh-HK':
    case 'zh-MO':
    case 'zh-CHT':
    case 'zh-Hant':
    case 'zh-Hant-TW':
    case 'zh-Hant-MO':
    case 'zh-Hant-HK':
        lang = 'zh-Hant'
        break
    case 'zh-CN':
    case 'zh-SG':
    case 'zh-CHS':
    case 'zh-Hans':
    case 'zh-Hans-CN':
    case 'zh-Hans-MO':
    case 'zh-Hans-HK':
    case 'zh-Hans-SG':
        lang = 'zh-Hans'
        break
    default:
        lang = 'en'
        break
}

export const defaultLang = lang

i18n.use(initReactI18next)
    .init({
        fallbackLng: 'en',
        lng: defaultLang,
        resources: {
            en: null,
            'zh-Hant': {
                translation: zhHant
            },
            'zh-Hans': {
                translation: zhHans
            }
        },
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n