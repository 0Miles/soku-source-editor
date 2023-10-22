import { useMemo } from 'react'

export const getI18nProperty = (root, property, i18nProperty, lang) => {
    let result = root[property]
    if (root[i18nProperty] && Array.isArray(root[i18nProperty])) {
        const i18nValue = root[i18nProperty].find(x => x.language === lang || x.language.startsWith(lang))
        if (i18nValue) {
            result = i18nValue.content
        }
    }
    return result
}

export default function I18nProperty({ root, property, i18nProperty, lang }) {
    return useMemo(() => getI18nProperty(root, property, i18nProperty, lang)
        , [root, property, i18nProperty, lang])
}