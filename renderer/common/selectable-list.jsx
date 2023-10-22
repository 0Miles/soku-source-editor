import { useCallback, useState } from 'react'
import {
    Checkbox, Button
} from '@fluentui/react-components'


export default function SelectableList({ items, itemTemplate, toolbar, selectModeToolbar, selectedChange }) {

    const [selectMode, setSelectMode] = useState(false)
    const [selected, setSelected] = useState(new Array(items?.length ?? 0).fill(false))

    const toggleSelected = useCallback((i) => {
        selected[i] = !selected[i]
        setSelected([...selected])
        selectedChange && selectedChange([...selected])
    }, [selected, selectedChange])


    return (
        <>
            <div className="mt:16 flex justify-content:space-between">
                {
                    !selectMode &&
                    <div className="@transition-left|.3s mr:6>button">
                        {toolbar}
                    </div>
                }
                {
                    selectMode &&
                    <div className="@transition-right|.3s mr:6>button">
                        {selectModeToolbar}
                    </div>
                }

                <Button onClick={() => { setSelected(new Array(items?.length ?? 0).fill(false)); setSelectMode(!selectMode) }} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M3.5 5.5l1.5 1.5l2.5 -2.5"></path>
                        <path d="M3.5 11.5l1.5 1.5l2.5 -2.5"></path>
                        <path d="M3.5 17.5l1.5 1.5l2.5 -2.5"></path>
                        <path d="M11 6l9 0"></path>
                        <path d="M11 12l9 0"></path>
                        <path d="M11 18l9 0"></path>
                    </svg>} />
            </div>
            <div className="my:8 grid grid-cols:1 gap:8 w:full">
                {
                    items &&
                    items.map((item, i) =>
                        <div key={i} className="rel flex align-items:center overflow-x:clip" onClick={() => toggleSelected(i)}>
                            {
                                selectMode &&
                                <Checkbox className="m:0 position:absolute!" checked={selected[i]} />
                            }
                            {
                                itemTemplate(item, selectMode)
                            }
                        </div>
                    )
                }
            </div>
        </>
    )
}