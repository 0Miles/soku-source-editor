import { Dropdown, Option, Textarea } from '@fluentui/react-components'
import { useCallback, useRef, useState } from 'react'
import { langCodes } from '../i18n'
import { useTranslation } from 'react-i18next'

export default function I18nPropertyTextarea({ label, propertyName, defaultLang, langs = ['default', ...langCodes], defaultValues, onChange }) {
    const { t } = useTranslation()
    const valuesRef = useRef(defaultValues ?? { default: '' })
    const [currentLang, setCurrentLang] = useState(defaultLang ?? 'default')
    const [currentValue, setCurrentValue] = useState(valuesRef.current[currentLang] ?? '')

    const langChangeHandler = (_, data) => {
        setCurrentLang(data.optionValue)
        setCurrentValue(valuesRef.current[data.optionValue] ?? '')
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
            <Dropdown tabIndex={-1} defaultValue={t(currentLang)} onOptionSelect={langChangeHandler} appearance="filled-darker">
                {
                    langs.map(x => <Option key={x} value={x} text={t(x)} onClick={() => setCurrentLang(x)}>
                        {t(x)}
                    </Option>)
                }
            </Dropdown>
        </div>
        <Textarea
            id={propertyName}
            rows={5}
            value={currentValue}
            onChange={textareaChangeHandler}
            resize="vertical"
            appearance="filled-darker" />
    </>
}