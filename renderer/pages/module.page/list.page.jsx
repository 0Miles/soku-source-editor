import {
    Button,
    Spinner
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useCallback, useMemo, useState } from 'react'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'
import * as api from '../../common/api'
import plusIcon from '../../icons/plus.icon'
import chevronRightIcon from '../../icons/chevron-right.icon'
import gearIcon from '../../icons/gear.icon'
import I18nProperty from '../../common/i18n-property'
import { useModSource } from '../../contexts/mod-source'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CommonItem from '../../common/common-item'
import AddModDialog from './compontents/add-module.dialog'

export default function ModuleListPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { sourceName } = useParams()
    const { primarySourceName } = useModSource()
    const { t, i18n } = useTranslation()

    const [loading, setLoading] = useState(false)
    const [mods, setMods] = useState([])
    const level = useMemo(() => {
            if (location.pathname.startsWith('/source')) {
                return 4
            }
            return 1
        }, [location])

    const refreshMods = useCallback(async () => {
        setLoading(true)
        setMods(await api.getMods(sourceName ?? primarySourceName))
        setLoading(false)
    }, [primarySourceName, sourceName])

    useMemo(() => {
        refreshMods()
    }, [refreshMods])

    return <MultiLevelPageContainer level={level}>
        {
            !primarySourceName &&
            <CommonItem
                title={t('No primary source set')}
                desc={t('You must first add at least one source and set a primary source')}
                footer={
                    <Button appearance="primary" onClick={() => { navigate('/source') }}>{t('Set up now')}</Button>
                }
            ></CommonItem>
        }
        {
            !!(primarySourceName || sourceName) && loading &&
            <Spinner />
        }
        {
            !!(primarySourceName || sourceName) && !loading &&
            <>
                <div className="mb:8 grid grid-cols:1 gap:4 w:full">
                    {
                        !!mods?.length &&
                        mods.map((modInfo, index) =>
                            <CommonItem
                                key={index}
                                onClick={() => navigate(`./info/${modInfo.name}`)}
                                fullIcon="true"
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
                                            <div className="flex w:full h:full justify-content:center align-items:center bg:gray/.2">
                                                {gearIcon}
                                            </div>
                                        }
                                    </>
                                }
                                title={modInfo.name}
                                desc={<I18nProperty root={modInfo} property={'description'} lang={i18n.language} />}
                                end={chevronRightIcon}
                            />
                        )
                    }
                    <AddModDialog sourceName={sourceName ?? primarySourceName} sourceMods={mods} onCompleted={refreshMods}/>
                </div>
            </>
        }
    </MultiLevelPageContainer>
}