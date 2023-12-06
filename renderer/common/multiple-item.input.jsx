import { useCallback, useMemo, useState } from 'react'
import {
    Checkbox, Button, Spinner, Input
} from '@fluentui/react-components'
import { nanoid } from 'nanoid'
import { useTranslation } from 'react-i18next'

import plusIcon from '../icons/plus.icon'
import trashIcon from '../icons/trash.icon'

export default function MultipleItemInput({ defaultItems, placeholder, itemTemplate, matchRegex, onChange }) {
    const { t } = useTranslation()
    const inputId = nanoid()
    const [items, setItems] = useState(defaultItems ?? [])
    const [inputValue, setInputValue] = useState('')
    const [valid, setValid] = useState(false)
    const [validMessage, setValidMessage] = useState('')

    const validationInputValue = (value) => {
        const match = value.match(matchRegex)
        
        let valid = !!value
        if (value && !match) {
            setValidMessage(t('Invalid input'))
            valid = false
        } else if (items.find(x => x === value)) {
            setValidMessage(t('The same value has been added'))
            valid = false
        } else {
            setValidMessage('')
        }
        setValid(valid)
    }

    const addItem = () => {
        items.push(inputValue)
        setItems([...items])
        setInputValue('')
        onChange && onChange(items)
    }

    const removeItem = (index) => {
        items.splice(index, 1)
        setItems([...items])
        onChange && onChange(items)
    }

    return (
        <>
            <div>
                {
                    items?.map(
                        (item, i) =>
                            <div key={i} className="flex align-items:center mb:6">
                                {itemTemplate(item)}
                                <Button onClick={() => removeItem(i)} icon={trashIcon} appearance="subtle" />
                            </div>
                    )
                }
            </div>

            <div className="flex align-items:center">
                <Input
                    id={inputId}
                    className="flex flex:1 mr:8"
                    value={inputValue}
                    onChange={(_, data) => { setInputValue(data.value); validationInputValue(data.value) }}
                    appearance="filled-darker"
                    placeholder={placeholder}
                />
                <Button icon={plusIcon} onClick={() => addItem()} appearance="subtle" disabled={!valid} />
            </div>
            <div className="mb:24">
                {validMessage}
            </div>
        </>
    )
}