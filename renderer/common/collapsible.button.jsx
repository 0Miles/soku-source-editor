import { useState } from 'react'
import {
    Button
} from '@fluentui/react-components'

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
                        !open &&
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M6 9l6 6l6 -6"></path>
                        </svg>
                    }
                    {
                        open &&
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M6 15l6 -6l6 6"></path>
                        </svg>
                    }
                </div>
            </Button>
        </div>
        {
            open &&
            <div className={`
                    bg:#2f2f30>div@dark bg:#eeeeee>div@light
                    {mt:2;p:16;pl:65;pr:50}>div
                    r:0|0|3|3 overflow:hidden
                    @transition-down|.3s|cubic-bezier(0.14,1,0.34,1)
                `}>
                {content}
            </div>
        }
    </div>)
}