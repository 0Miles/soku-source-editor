import {
    Button,
    MenuItem,
    Spinner
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'
import ListItemButton from '../../common/list-item.button'

import plusIcon from '../../icons/plus.icon'
import pencilIcon from '../../icons/pencil.icon'
import trashIcon from '../../icons/trash.icon'
import gearIcon from '../../icons/gear.icon'
import I18nProperty from '../../common/i18n-property'
import { useModSource } from '../../contexts/mod-source'
import { useNavigate } from 'react-router-dom'
import ControlItem from '../../common/control-item'

export default function ModuleListPage() {
    const navigate = useNavigate()
    const { currentMods, refreshCurrentMods, primarySourceName } = useModSource()
    const { t, i18n } = useTranslation()

    const [loading, setLoading] = useState(false)
    const [mods, setMods] = useState([])

    useMemo(() => {
        (async () => {
            if (!currentMods) {
                setLoading(true)
                await refreshCurrentMods()
                setLoading(false)
            } else {
                setMods(currentMods)
            }
        })()
    }, [currentMods, refreshCurrentMods])

    return <MultiLevelPageContainer>
        {
            !primarySourceName &&
            <ControlItem
                title={t('No primary source set')}
                desc={t('You must first add at least one source and set a primary source')}
                control={
                    <Button appearance="primary" onClick={() => { navigate('/source') }}>{t('Set up now')}</Button>
                }
            ></ControlItem>
        }
        {
            !!primarySourceName && loading &&
            <Spinner />
        }
        {
            !!primarySourceName && !loading &&
            <>
                <div className="mb:8 grid grid-cols:1 gap:8 w:full">
                    {
                        !!mods?.length &&
                        mods.map((modInfo, index) =>
                            <ListItemButton
                                key={index}
                                href={`/module/info/${modInfo.name}`}
                                icon={
                                    <>
                                        {
                                            !!modInfo.icon &&
                                            <img className="w:full h:full obj:cover"
                                                src={modInfo.icon}
                                            />
                                        }
                                        {
                                            !modInfo.icon &&
                                            <div className="flex w:full h:full align-items:center justify-content:center bg:gray/.2">
                                                {gearIcon}
                                            </div>
                                        }
                                    </>
                                }
                                content={
                                    <div className="flex:1 w:0 {my:2;font-weight:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}>div">
                                        <div className="f:18">
                                            {modInfo.name}
                                        </div>
                                        <div>
                                            <I18nProperty root={modInfo} property={'description'} lang={i18n.language} />
                                        </div>
                                    </div>
                                }
                                options={
                                    <>
                                        <MenuItem icon={pencilIcon}>{t('Edit')}</MenuItem>
                                        <MenuItem icon={trashIcon}>{t('Delete')}</MenuItem>
                                    </>
                                }
                            />
                        )
                    }
                    <Button className="w:full min-h:80 cursor:auto!" appearance="subtle">
                        {plusIcon}
                    </Button>
                </div>
            </>
        }
    </MultiLevelPageContainer>
}