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
        <Card className="w:full p:0!">
            <Button as="div" onClick={() => { navigate(href) }} className="justify-content:space-between m:0! p:0! b:0!" appearance="subtle">
                <div className="flex aspect:1/1 flex:0|0|80px h:full overflow:hidden align-items:center justify-content:center">
                    {icon}
                </div>
                <div className="flex flex:1 w:0 flex:col text-align:left mx:16 py:8 {my:2;font-weight:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}>div">
                    {content}
                </div>
                <Menu hasIcons={true}>
                    <MenuTrigger disableButtonEnhancement>
                        <Button as="div" appearance="transparent" onClick={event => { event.stopPropagation() }} icon={optionsIcon} />
                    </MenuTrigger>

                    <MenuPopover>
                        <MenuList onClick={event => { event.stopPropagation() }}>
                            {options}
                        </MenuList>
                    </MenuPopover>
                </Menu>
            </Button>
        </Card>
    )
}