import {
    Button,
    Card,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList
} from '@fluentui/react-components'
import { useNavigate } from 'react-router-dom'
import optionsIcon from '../icons/options.icon'

export default function ListItemButton({href, icon, content, options}) {
    const navigate = useNavigate()
    
    return (
        <div className="flex flex:col p:0! r:3 bg:#2f2f30@dark bg:#eeeeee@light user-select:none">
            <Button as="div" onClick={() => { navigate(href) }} className="justify-content:space-between m:0! p:0! b:0! cursor:auto!" appearance="subtle">
                <div className="flex aspect:1/1 flex:0|0|80px h:full overflow:clip align-items:center justify-content:center">
                    {icon}
                </div>
                <div className="flex flex:1 w:0 px:16 py:8">
                    {content}
                </div>
                <Menu hasIcons={true}>
                    <MenuTrigger disableButtonEnhancement>
                        <Button as="div" className="cursor:auto!" appearance="transparent" onClick={event => { event.stopPropagation() }} icon={optionsIcon} />
                    </MenuTrigger>

                    <MenuPopover>
                        <MenuList onClick={event => { event.stopPropagation() }}>
                            {options}
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </Button>
        </div>
    )
}