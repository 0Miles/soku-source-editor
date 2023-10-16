import {
    Card,
    CardHeader,
    CardPreview,
    Spinner,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    Button
} from '@fluentui/react-components'
import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../templates/page-container'
import Temp from '../../temp'

import plusIcon from '../../icons/plus.icon'
import optionsIcon from '../../icons/options.icon'
import pencilIcon from '../../icons/pencil.icon'
import trashIcon from '../../icons/trash.icon'

export default function ModuleInfoPage() {
    const { modName } = useParams()
    const { t } = useTranslation()

    const [loading, setLoading] = useState(true)
    const [mod, setMod] = useState(null)

    useMemo(() => {
        (async () => {
            setLoading(true)
            const data = Temp['mods']?.find(x => x.name === modName)
            setMod(data)
            setLoading(false)
        })()
    }, [modName])

    return <PageContainer>
        {
            loading &&
            <Spinner />
        }
        {
            !loading && !!mod &&
            <div>
                <div className={`rel w:full overflow:hidden pt:60 p:24 mb:16 border-radius:6|6|0|0 bg:linear-gradient(rgba(0,0,0,.65)|0%,rgba(32,32,32,.9)|60%,rgba(32,32,32,1)|75%)@dark bg:linear-gradient(rgba(200,200,200,.65)|0%,rgba(255,255,255,.85)|60%,rgba(255,255,255,1)|75%)@light`}>
                    {
                        !!mod.banner &&
                        <img src={mod.banner} className="abs z:-1 top:0 left:0 w:full h:80% object-fit:cover" />
                    }
                    <div className="flex w:full align-items:center justify-content:center">
                        <div className="flex aspect:1/1 flex:0|0|120px h:full overflow:hidden align-items:center justify-content:center bg:gray/.2">
                            {
                                !!mod.icon &&
                                <img src={mod.icon} className="obj:cover w:full h:full" />
                            }
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path>
                                <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                            </svg>
                        </div>
                        <div className="flex flex:1 w:0 flex:col text-align:left mx:24 {white-space:nowrap;overflow:hidden;text-overflow:ellipsis}>div">
                            <div className="f:32 line-height:normal font-weight:bold">
                                {mod.name}
                            </div>
                            <div className="my:8 font-weight:normal">
                                {mod.desc}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="my:10 grid grid-cols:1 gap:10 w:full">
                    <Card className="w:full p:0!">
                        <Button as="div" onClick={() => { navigate(`/module/info/${mod.name}`) }} className="justify-content:space-between m:0! p:0!" appearance="subtle">
                            <div className="flex aspect:1/1 flex:0|0|80px h:full overflow:hidden flex align-items:center justify-content:center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                    <path d="M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
                                    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10"></path>
                                    <path d="M10 12l4 0"></path>
                                </svg>
                            </div>
                            <div className="flex flex:1 w:0 flex:col text-align:left mx:16 py:8 {white-space:nowrap;overflow:hidden;text-overflow:ellipsis}>div">
                                <div className="f:18 font-weight:normal">
                                    v1.0.0
                                </div>
                            </div>
                            <Menu hasIcons={true}>
                                <MenuTrigger disableButtonEnhancement>
                                    <Button as="div" appearance="transparent" onClick={event => { event.stopPropagation() }} icon={optionsIcon} />
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
                </div>
                <Button className="w:full min-h:80" appearance="subtle">
                    {plusIcon}
                </Button>
            </div>
        }
    </PageContainer>
}