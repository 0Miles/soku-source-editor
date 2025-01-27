import { useTranslation } from 'react-i18next'
import {
    Select
} from '@fluentui/react-components'
import { useShared } from '../contexts/shared'
import { defaultLang, langCodes } from '../i18n'

export default function ChangeLanguageSelect({className}) {
    const { config, setConfigValue } = useShared()
    const { i18n, t } = useTranslation()

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang)
        setConfigValue('lang', lang)
    }

    return <Select defaultValue={config?.lang ?? defaultLang} onChange={(_, data) => { changeLanguage(data.value) }} className={className ?? ''}>
        {
            langCodes.map(x => <option key={x} value={x}>
                {t(x)}
            </option>)
        }
    </Select>
}