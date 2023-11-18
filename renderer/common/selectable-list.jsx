import { useCallback, useMemo, useState } from 'react'
import {
    Checkbox, Button, Spinner
} from '@fluentui/react-components'
import { nanoid } from 'nanoid'


export default function SelectableList({ items, itemTemplate, toolbar, selectModeToolbar, selectedChange, className, loading=false }) {

    const [selectMode, setSelectMode] = useState(false)
    const [indexSelected, setIndexSelected] = useState(() => new Array(items?.length ?? 0).fill(false))

    const toggleSelected = useCallback((i) => {
        indexSelected[i] = !indexSelected[i]
        setIndexSelected([...indexSelected])
        selectedChange && selectedChange(items.filter((_, index) => indexSelected[index]))
    }, [indexSelected, items, selectedChange])

    useMemo(() => {
        setIndexSelected(new Array(items?.length ?? 0).fill(false))
        selectedChange && selectedChange([])
    }, [items, selectedChange])

    return (
        <div className={className}>
            <div className="flex justify-content:space-between">
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

                <Button onClick={() => { setIndexSelected(new Array(items?.length ?? 0).fill(false)); setSelectMode(!selectMode) }} icon={
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
            {
                loading && <Spinner />
            }
            {
                !loading &&
                <div className="my:8 grid grid-cols:1 gap:4 w:full overflow-x:clip">
                    {
                        items &&
                        items.map((item, i) =>
                            <div key={i} className={`rel flex align-items:center {view-transition-name:selectable-item-${nanoid()}}  ~transform|.3s|ease ${selectMode ? 'translate(2.5rem)' : ''}`} onClick={() => toggleSelected(i)}>
                                {
                                    selectMode &&
                                    <Checkbox className="m:0 abs! ml:-2.5rem" checked={indexSelected[i]} />
                                }
                                {
                                    itemTemplate && itemTemplate(item, selectMode, i)
                                }
                            </div>
                        )
                    }
                </div>
            }
        </div>
    )
}