import { useContext } from 'react'
import { ThemeContext } from '../theme'
import {
    Button,
    Menu,
    MenuTrigger,
    MenuList,
    MenuItem,
    MenuPopover
} from '@fluentui/react-components'
import darkThemeIcon from '../icons/dark-theme.icon'
import lightThemeIcon from '../icons/light-theme.icon'

export default function SwitchThemeButton() {
    const themeContext = useContext(ThemeContext)

    return (
        <Menu hasIcons={true}>
            <MenuTrigger disableButtonEnhancement>
                <Button icon={themeContext.current === 'dark' ? darkThemeIcon : lightThemeIcon} />
            </MenuTrigger>
            
            <MenuPopover>
                <MenuList>
                    <MenuItem onClick={() => themeContext.switchTheme('light')} icon={lightThemeIcon}>Light </MenuItem>
                    <MenuItem onClick={() => themeContext.switchTheme('dark')} icon={darkThemeIcon}>Dark</MenuItem>
                    <MenuItem onClick={() => themeContext.switchTheme('system')} icon={'💻'}>System</MenuItem>
                </MenuList>
            </MenuPopover>
        </Menu>
    )
}