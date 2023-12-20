import { useTranslation } from 'react-i18next'
import {
    Select
} from '@fluentui/react-components'
import { useShared } from '../contexts/shared'

export default function ChangeLanguageSelect({className}) {
    const { setConfigValue } = useShared()
    const { i18n } = useTranslation()

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang)
        setConfigValue('lang', lang)
    }

    return <Select value={i18n.language} onChange={(_, data) => { changeLanguage(data.value) }} className={className ?? ''}>
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