import { useState } from 'react'
import {
    Button
} from '@fluentui/react-components'

import chevronUpIcon from '../icons/chevron-up.icon'
import chevronDownIcon from '../icons/chevron-down.icon'
import CommonItem from './common-item'

export default function CollapsibleItem({ icon, title, desc, footer, content, defaultOpen, className, allowOpen=true }) {

    const [open, setOpen] = useState(defaultOpen ?? false)

    return (<div className={className}>
        <div className={`
                ${allowOpen && open ? 'r:3|3|0|0' : 'r:3'}
                flex flex:col overflow:clip
                bg:#2f2f30@dark bg:#eeeeee@light
                user-select:none
            `}>
            <CommonItem
                onClick={() => { allowOpen && document.startViewTransition(_ => setOpen(!open)) }}
                icon={icon}
                title={title}
                desc={desc}
                footer={footer}
                end={
                    <>
                        {
                            !(allowOpen && open) && chevronDownIcon
                        }
                        {
                            allowOpen && open && chevronUpIcon
                        }
                    </>
                }
            />
        </div>
        {
            allowOpen && open &&
            <div className={`
                    bg:#2f2f30>div@dark bg:#eeeeee>div@light
                    {mt:2;p:16;pl:56;pr:40}>div
                    r:0|0|3|3 overflow:hidden user-select:none
                `}>
                {content}
            </div>
        }
    </div>)
}