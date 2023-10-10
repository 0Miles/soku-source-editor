import {
    Button,
    Card,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem
} from '@fluentui/react-components'
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../common/page-container'
import optionsIcon from '../../icons/options.icon'
import plusIcon from '../../icons/plus.icon'
import pencilIcon from '../../icons/pencil.icon'
import trashIcon from '../../icons/trash.icon'

export default function ModuleListPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { t } = useTranslation()
    const [layersCount, setLayersCount] = useState(2)

    useEffect(() => {
        const paths = location?.pathname?.split('/')
        if (paths.length !== layersCount) {
            setLayersCount(paths.length)
        }
    }, [location, layersCount])

    return <>
        <div className={`flex flex:auto h:0 w:200% ~translate|.2s|cubic-bezier(0.66,0,0.86,0) ${layersCount > 2 ? '{translate:-50%}' : ''}`}>

            <PageContainer>
                <div className="@page-transition-in|.3s|cubic-bezier(0.14,1,0.34,1) grid grid-cols:2@xs grid-cols:1@sm grid-cols:2@md gap:10 w:full">
                    {
                        [1, 2, 3, 4, 5].map(i =>
                            <Card key={i} className="w:full p:0!">
                                <Button as="div" onClick={() => { navigate(`/module/info/${i}`) }} className="justify-content:space-between m:0! p:0!" appearance="subtle">
                                    <div className="flex aspect:1/1 min-w:86 max-w:86 overflow:hidden flex align-items:center justify-content:center bg:gray/.2">
                                        <img className="w:full h:full obj:cover"
                                            src="file:///C:\Users\Miles\OneDrive\圖片\Saved Pictures\46e8086bc7c27edaec02f765dd2727dfcfc78e3c.jpg"
                                        />
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path>
                                            <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                                        </svg>
                                    </div>
                                    <div className="flex flex:1 w:0 flex:col text-align:left mx:16 {white-space:nowrap;overflow:hidden;text-overflow:ellipsis}>div">
                                        <div className="f:18 font-weight:normal">
                                            Mod Name
                                        </div>
                                        <div className="mt:2 font-weight:normal">
                                            mod desc adfasfdsadfadsfasdfawgwafsadfsadf
                                        </div>
                                        <div className="mt:8 font-weight:normal opacity:.8">
                                            version: 1.0.0
                                        </div>
                                    </div>
                                    <Menu hasIcons={true}>
                                        <MenuTrigger disableButtonEnhancement>
                                            <Button className="bg:auto:hover" as="div" appearance="transparent" onClick={event => { event.stopPropagation() }} icon={optionsIcon} />
                                        </MenuTrigger>

                                        <MenuPopover>
                                            <MenuList onClick={event => { event.stopPropagation() }}>
                                                <MenuItem icon={pencilIcon}>{t('Edit')}</MenuItem>
                                                <MenuItem icon={trashIcon}>{t('Delete')}</MenuItem>
                                            </MenuList>
                                        </MenuPopover>
                                    </Menu>
                                </Button>
                            </Card>
                        )
                    }


                    <Button className="mb:16">
                        {plusIcon}
                    </Button>
                </div>
            </PageContainer>

            <PageContainer>
                <Outlet />
            </PageContainer>
        </div>
    </>
}