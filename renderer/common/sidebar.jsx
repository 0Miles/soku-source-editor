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
            <Tab value="setting" icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M6 3a1 1 0 0 1 .993 .883l.007 .117v3.171a3.001 3.001 0 0 1 0 5.658v7.171a1 1 0 0 1 -1.993 .117l-.007 -.117v-7.17a3.002 3.002 0 0 1 -1.995 -2.654l-.005 -.176l.005 -.176a3.002 3.002 0 0 1 1.995 -2.654v-3.17a1 1 0 0 1 1 -1z" strokeWidth="0" fill="currentColor"></path>
                    <path d="M12 3a1 1 0 0 1 .993 .883l.007 .117v9.171a3.001 3.001 0 0 1 0 5.658v1.171a1 1 0 0 1 -1.993 .117l-.007 -.117v-1.17a3.002 3.002 0 0 1 -1.995 -2.654l-.005 -.176l.005 -.176a3.002 3.002 0 0 1 1.995 -2.654v-9.17a1 1 0 0 1 1 -1z" strokeWidth="0" fill="currentColor"></path>
                    <path d="M18 3a1 1 0 0 1 .993 .883l.007 .117v.171a3.001 3.001 0 0 1 0 5.658v10.171a1 1 0 0 1 -1.993 .117l-.007 -.117v-10.17a3.002 3.002 0 0 1 -1.995 -2.654l-.005 -.176l.005 -.176a3.002 3.002 0 0 1 1.995 -2.654v-.17a1 1 0 0 1 1 -1z" strokeWidth="0" fill="currentColor"></path>
                </svg>}>{t('Setting')}</Tab>
        </TabList>
    </>
}