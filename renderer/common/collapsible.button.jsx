import { useState } from 'react'
import {
    Button
} from '@fluentui/react-components'

import chevronUpIcon from '../icons/chevron-up.icon'
import chevronDownIcon from '../icons/chevron-down.icon'

export default function CollapsibleButton({ icon, body, content, defaultOpen }) {

    const [open, setOpen] = useState(defaultOpen ?? false)

    return (<div>
        <div className={`
                ${open ? 'r:3|3|0|0' : 'r:3'}
                flex flex:col p:0! overflow:hidden
                bg:#2f2f30@dark bg:#eeeeee@light
                user-select:none
            `}>
            <Button as="div" onClick={() => { setOpen(!open) }} className="justify-content:space-between m:0! p:0! b:0! r:0! cursor:auto!" appearance="subtle">
                <div className="flex aspect:1/1 flex:0|0|65px h:full overflow:hidden align-items:center justify-content:center my:4">
                    {icon}
                </div>
                <div className="flex flex:1 text-align:left py:8 justify-content:space-between">
                    {body}
                </div>
                <div className="m:16">
                    {
                        !open && chevronDownIcon
                    }
                    {
                        open && chevronUpIcon
                    }
                </div>
            </Button>
        </div>
        {
            open &&
            <div className={`
                    bg:#2f2f30>div@dark bg:#eeeeee>div@light
                    {mt:2;p:16;pl:65;pr:50}>div
                    r:0|0|3|3 overflow:hidden user-select:none
                    @transition-down|.3s|cubic-bezier(0.14,1,0.34,1)
                `}>
                {content}
            </div>
        }
    </div>)
}