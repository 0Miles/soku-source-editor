import {
    Spinner,
    MenuItem,
    Button
} from '@fluentui/react-components'
import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../templates/page-container'
import Temp from '../../temp'
import { getMods } from '../../common/api'

import plusIcon from '../../icons/plus.icon'
import pencilIcon from '../../icons/pencil.icon'
import trashIcon from '../../icons/trash.icon'
import gearIcon from '../../icons/gear.icon'
import boxIcon from '../../icons/box.icon'
import ListItemButton from '../../common/list-item.button'

export default function ModuleInfoPage() {
    const { modName } = useParams()
    const { t } = useTranslation()

    const [loading, setLoading] = useState(false)
    const [mod, setMod] = useState(null)

    useMemo(() => {
        (async () => {
            if (!Temp['mods']) {
                setLoading(true)
                const data = await getMods()
                setMod(data.find(x => x.name === modName))
                setLoading(false)
            } else {
                setMod(Temp['mods'].find(x => x.name === modName))
            }
        })()
    }, [modName])

    return <PageContainer>
        {
            loading &&
            <Spinner />
        }
        {
            !loading && !!mod &&
            <>
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
                            {
                                !mod.icon &&
                                <div className="flex w:full h:full align-items:center justify-content:center bg:gray/.2">
                                    {gearIcon}
                                </div>
                            }
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
                    <ListItemButton
                        icon={boxIcon}
                        content={
                            <div className="f:18">
                                v1.0.0
                            </div>
                        }
                        options={
                            <>
                                <MenuItem icon={pencilIcon}>{t('Edit')}</MenuItem>
                                <MenuItem icon={trashIcon}>{t('Delete')}</MenuItem>
                            </>
                        }
                    />

                </div>
                <Button className="w:full min-h:80" appearance="subtle">
                    {plusIcon}
                </Button>
            </>
        }
    </PageContainer>
}