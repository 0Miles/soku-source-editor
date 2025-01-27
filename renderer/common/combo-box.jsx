import { Badge, Combobox, Option } from "@fluentui/react-components"
import { useState } from "react"

export default function ComboBox({ id, defaultSelected, defaultValue, options, onOptionSelect, multiselect, freeform, comboboxProps }) {
    const [selected, setSelected] = useState(defaultSelected)
    const [open, setOpen] = useState(false)

    return <>
        <Combobox
            id={id}
            defaultValue={defaultValue}
            defaultSelectedOptions={selected}
            {...comboboxProps}
            multiselect={multiselect}
            onOptionSelect={(e, data) => {
                setSelected(data.selectedOptions);
                onOptionSelect && onOptionSelect(e, data)
            }}
            freeform={freeform}
            onOpenChange={(_, data) => setOpen(data.open)}
            appearance="filled-darker"
        >
            {
                selected?.filter(x => !options.includes(x))
                    .map(option =>
                        <Option key={option}>
                            {option}
                        </Option>
                    )
            }
            {
                options.map(option =>
                    <Option key={option}>
                        {option}
                    </Option>
                )
            }
        </Combobox>

        <label htmlFor={id} className={`${open ? 'opacity:.2' : ''} z:9 mt:-30! h:30 flex py:4 pl:8 flex-wrap:nowrap overflow:clip`}>
            <div className="flex flex-wrap:nowrap mr:42 gap:4 overflow:clip">
                {
                    multiselect &&
                    selected.map((filename, i) => <Badge key={i}>{filename}</Badge>)
                }
            </div>
        </label>
    </>
}