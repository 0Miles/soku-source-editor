import { useTheme } from '../contexts/theme'
import {
    Button,
    Menu,
    MenuTrigger,
    MenuList,
    MenuItem,
    MenuPopover
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import darkThemeIcon from '../icons/dark-theme.icon'
import lightThemeIcon from '../icons/light-theme.icon'

export default function SwitchThemeButton() {
    const { current, switchTheme } = useTheme()
    const { t } = useTranslation()

    return (
        <Menu hasIcons={true}>
            <MenuTrigger disableButtonEnhancement>
                <Button icon={current === 'dark' ? darkThemeIcon : lightThemeIcon} />
            </MenuTrigger>
            
            <MenuPopover>
                <MenuList>
                    <MenuItem onClick={() => switchTheme('light')} icon={lightThemeIcon}>{t('Light')} </MenuItem>
                    <MenuItem onClick={() => switchTheme('dark')} icon={darkThemeIcon}>{t('Dark')}</MenuItem>
                    <MenuItem onClick={() => switchTheme('system')} icon={'💻'}>{t('System')}</MenuItem>
                </MenuList>
            </MenuPopover>
        </Menu>
    )
}