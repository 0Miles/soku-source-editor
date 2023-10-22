import {
    Button,
    MenuItem,
    Spinner
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { getMods } from '../../common/api'
import { useMemo, useState } from 'react'
import Temp from '../../temp'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'
import ListItemButton from '../../common/list-item.button'

import plusIcon from '../../icons/plus.icon'
import pencilIcon from '../../icons/pencil.icon'
import trashIcon from '../../icons/trash.icon'
import gearIcon from '../../icons/gear.icon'
import I18nProperty from '../../common/i18n-property'

export default function ModuleListPage() {
    const { t, i18n } = useTranslation()

    const [loading, setLoading] = useState(false)
    const [mods, setMods] = useState([])

    useMemo(() => {
        (async () => {
            if (!Temp['mods']) {
                setLoading(true)
                const data = await getMods()
                setMods(data)
                setLoading(false)
            } else {
                setMods(Temp['mods'])
            }
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
                <div className="my:10 grid grid-cols:1 gap:6 w:full">
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
                                            <I18nProperty root={modInfo} property={'description'} i18nProperty={'i18nDescription'} lang={i18n.language} />
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
                </div>
                <Button className="w:full min-h:80" appearance="subtle">
                    {plusIcon}
                </Button>
            </>
        }
    </MultiLevelPageContainer>
}