import { Select, Option, Textarea } from '@fluentui/react-components'
import { useCallback, useRef, useState } from 'react'
import { langCodes } from '../i18n'
import { useTranslation } from 'react-i18next'

export default function I18nPropertyTextarea({ label, propertyName, defaultLang, langs = ['default', ...langCodes], defaultValues, onChange }) {
    const { t } = useTranslation()
    const valuesRef = useRef(defaultValues ?? { default: '' })
    const [currentLang, setCurrentLang] = useState(defaultLang ?? 'default')
    const [currentValue, setCurrentValue] = useState(valuesRef.current[currentLang] ?? '')

    const langChangeHandler = (_, data) => {
        setCurrentLang(data.value)
        setCurrentValue(valuesRef.current[data.value] ?? '')
    }

    const textareaChangeHandler = useCallback((e) => {
        setCurrentValue(e.target.value)
        const newValues = { ...valuesRef.current, [currentLang]: e.target.value }
        valuesRef.current = newValues
        onChange && onChange(newValues)
    }, [currentLang, onChange])

    return <>
        <div className="mt:16 flex align-items:center justify-content:space-between mb:4">
            <label htmlFor={propertyName}>{label ?? t(propertyName)}</label>
            <Select tabIndex={-1} appearance="filled-darker" defaultValue={currentLang} onChange={langChangeHandler}>
                {
                    langs.map(x => <option key={x} value={x}>
                        {t(x)}
                    </option>)
                }
            </Select>
        </div>
        <Textarea
            id={propertyName}
            rows={5}
            defaultValue={currentValue}
            onChange={textareaChangeHandler}
            resize="vertical"
            appearance="filled-darker" />
    </>
}