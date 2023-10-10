import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Select
} from '@fluentui/react-components'

export default function ChangeLanguageSelect({className}) {
    const [lang, setLang] = useState(localStorage.getItem('lang') ?? 'en')
    const { i18n } = useTranslation()

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang)
        setLang(lang)
        localStorage.setItem('lang', lang)
    }

    return <Select defaultValue={lang} onChange={(_, data) => { changeLanguage(data.value) }} className={className ?? ''}>
        <option value="en">
            English
        </option>
        <option value="zh-Hant">
            中文 (繁體)
        </option>
        <option value="zh-Hans">
            中文 (简体)
        </option>
    </Select>
}