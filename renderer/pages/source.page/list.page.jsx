import {
    Button,
    MenuItem,
    Spinner
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useMemo, useState, useContext } from 'react'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'
import ListItemButton from '../../common/list-item.button'

import pencilIcon from '../../icons/pencil.icon'
import trashIcon from '../../icons/trash.icon'
import { DataContext } from '../../data'
import AddSourceDialog from './compontents/add-source.dialog'

export default function SourceListPage() {
    const { sources, refreshSources } = useContext(DataContext)
    const { t, i18n } = useTranslation()

    const [loading, setLoading] = useState(false)

    useMemo(() => {
        (async () => {
            if (!sources) {
                setLoading(true)
                await refreshSources()
                setLoading(false)
            }
        })()
    }, [refreshSources, sources])

    return <MultiLevelPageContainer>
        {
            loading &&
            <Spinner />
        }
        {
            !loading &&
            <>
                <div className="mb:8 grid grid-cols:1 gap:8 w:full">
                    {
                        !!sources?.length &&
                        sources.map((sourceInfo, index) =>
                            <ListItemButton
                                key={index}
                                href={`/source/info/${sourceInfo.name}`}
                                icon={
                                    <div className="flex w:full h:full align-items:center justify-content:center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                            <path d="M16 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                                            <path d="M12 8m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                                            <path d="M12 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path>
                                            <path d="M12 15v-6"></path>
                                            <path d="M15 11l-2 -2"></path>
                                            <path d="M11 7l-1.9 -1.9"></path>
                                            <path d="M13.446 2.6l7.955 7.954a2.045 2.045 0 0 1 0 2.892l-7.955 7.955a2.045 2.045 0 0 1 -2.892 0l-7.955 -7.955a2.045 2.045 0 0 1 0 -2.892l7.955 -7.955a2.045 2.045 0 0 1 2.892 0z"></path>
                                        </svg>
                                    </div>
                                }
                                content={
                                    <div className="ml:-16 flex:1 w:0 {my:2;font-weight:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}>div">
                                        <div className="f:18">
                                            {sourceInfo.name}
                                        </div>
                                        {
                                            !sourceInfo.isSource &&
                                            <div className="flex f:12 color:red">
                                                {t('Not mod source')}
                                            </div>
                                        }
                                        {
                                            sourceInfo.isSource &&
                                            <div className="flex f:12 align-items:center opacity:.8">
                                                {
                                                    !!sourceInfo.branch &&
                                                    <div className="mr:8 flex align-items:center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                            <path d="M7 18m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                                                            <path d="M7 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                                                            <path d="M17 6m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"></path>
                                                            <path d="M7 8l0 8"></path>
                                                            <path d="M9 18h6a2 2 0 0 0 2 -2v-5"></path>
                                                            <path d="M14 14l3 -3l3 3"></path>
                                                        </svg>
                                                        <div className="ml:2">
                                                            {sourceInfo.branch}
                                                        </div>
                                                    </div>
                                                }
                                                {
                                                    sourceInfo.sync?.waitPull === 0 && sourceInfo.sync?.waitPush === 0 &&
                                                    <div className="flex align-items:center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="color:green" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                            <path d="M5 12l5 5l10 -10"></path>
                                                        </svg>
                                                        {t('Synced')}
                                                    </div>
                                                }
                                                {
                                                    (sourceInfo.sync?.waitPull > 0 || sourceInfo.sync?.waitPush > 0) &&
                                                    <>
                                                        

                                                        <Button 
                                                            onClick={async (event) => {
                                                                    event.stopPropagation()
                                                                    await ipcRenderer.invoke('get', ['sync', sourceInfo.name, sourceInfo.branch])
                                                            }}
                                                            className="m:0! p:0! min-w:auto! font-weight:normal! f:12!" appearance="subtle">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                                    <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"></path>
                                                                    <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"></path>
                                                                </svg>
                                                                <div className="ml:4 flex align-items:center">
                                                                    {sourceInfo.sync.waitPull}
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                                        <path d="M12 5l0 14"></path>
                                                                        <path d="M16 15l-4 4"></path>
                                                                        <path d="M8 15l4 4"></path>
                                                                    </svg>
                                                                </div>

                                                                <div className="flex align-items:center">
                                                                    {sourceInfo.sync.waitPush}
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                                        <path d="M12 5l0 14"></path>
                                                                        <path d="M16 9l-4 -4"></path>
                                                                        <path d="M8 9l4 -4"></path>
                                                                    </svg>
                                                                </div>
                                                        </Button>
                                                    </>
                                                }
                                            </div>
                                        }
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
                    <AddSourceDialog></AddSourceDialog>
                </div>
            </>
        }
    </MultiLevelPageContainer>
}