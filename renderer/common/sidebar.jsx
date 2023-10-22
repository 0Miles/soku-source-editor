import { useEffect, useState } from 'react'
import SwitchThemeButton from './switch-theme.button'
import {
    TabList,
    Tab
} from '@fluentui/react-components'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ChangeLanguageSelect from './change-language.select'
import modIcon from '../icons/mod.icon'
import sourceIcon from '../icons/source.icon'

export default function Sidebar({ onTabChange }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { t } = useTranslation()
    const [selectedTab, setSelectedTab] = useState('module')

    useEffect(() => {
        const tab = location?.pathname?.split('/')?.[1]
        if (tab !== selectedTab) {
            setSelectedTab(tab)
            onTabChange && onTabChange(tab)
        }
    }, [location, onTabChange, selectedTab])
    
    return <>
        <div className="mb:16 flex">
            <ChangeLanguageSelect className="flex flex:1 mr:4" />
            <SwitchThemeButton />
        </div>
        <TabList className="
                        {my:2;p:8;~background|.1s}>button
                        font-weight:normal!>button[aria-selected=true]>span
                        bg:gray/.2!>button[aria-selected=true]
                        bg:gray-70/.2!>button[aria-selected=true]@light
                        bg:gray/.2!>button:hover
                        bg:gray-70/.2!>button:hover@light
                        cursor:auto>button
                    "
            onTabSelect={(event, data) => navigate('/' + data.value)}
            defaultSelectedValue={selectedTab}
            selectedValue={selectedTab}
            vertical>
            <Tab value="module" icon={modIcon}>{t('Module')}</Tab>
            <Tab value="source" icon={sourceIcon}>{t('Source')}</Tab>
        </TabList>
    </>
}