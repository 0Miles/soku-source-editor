import {
    Button,
    Card,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    Spinner,
    Badge
} from '@fluentui/react-components'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMods } from '../../common/api'
import optionsIcon from '../../icons/options.icon'
import plusIcon from '../../icons/plus.icon'
import pencilIcon from '../../icons/pencil.icon'
import trashIcon from '../../icons/trash.icon'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'
import { useMemo, useState } from 'react'
import Temp from '../../temp'

export default function ModuleListPage() {
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [loading, setLoading] = useState(true)
    const [mods, setMods] = useState([])

    useMemo(() => {
        (async () => {
            const data = await getMods()
            setMods(data)
            Temp['mods'] = data
            setLoading(false)
        })()
    }, [])

    return <MultiLevelPageContainer>
        {
            loading &&
            <Spinner />
        }
        {
            !loading &&
            <>
                <div className="my:10 grid grid-cols:1 gap:10 w:full">
                    {
                        !!mods?.length &&
                        mods.map((mod, index) =>
                            <Card key={index} className="w:full p:0!">
                                <Button as="div" onClick={() => { navigate(`/module/info/${mod.name}`) }} className="justify-content:space-between m:0! p:0! b:0!" appearance="subtle">
                                    <div className="flex aspect:1/1 flex:0|0|80px h:full overflow:hidden align-items:center justify-content:center bg:gray/.2">
                                        {
                                            !!mod.icon &&
                                            <img className="w:full h:full obj:cover"
                                                src={mod.icon}
                                            />
                                        }
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z"></path>
                                            <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path>
                                        </svg>
                                    </div>
                                    <div className="flex flex:1 w:0 flex:col text-align:left mx:16 py:8 {white-space:nowrap;overflow:hidden;text-overflow:ellipsis}>div">
                                        <div className="f:18 font-weight:normal">
                                            {mod.name}
                                        </div>
                                        <div className="mt:2 font-weight:normal">
                                            {mod.desc}
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
                        )
                    }
                </div>
                <Button className="w:full min-h:80" appearance="subtle">
                    {plusIcon}
                </Button>
            </>
        }
    </MultiLevelPageContainer>
}