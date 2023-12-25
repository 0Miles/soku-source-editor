import { Button, Spinner } from '@fluentui/react-components'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'
import { useShared } from '../../contexts/shared'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import CommonItem from '../../common/common-item'
import { useNavigate, useParams } from 'react-router-dom'
import chevronRightIcon from '../../icons/chevron-right.icon'
import modIcon from '../../icons/mod.icon'
import * as api from '../../common/api'
import GitStatus from './compontents/git-status'
import { formatString } from '../../common/format-string'

export default function SourceInfoPage() {
    const navigate = useNavigate()
    const { sources, refreshSources } = useShared()
    const { sourceName } = useParams()
    const { t } = useTranslation()
    const [sourceInfo, setSourceInfo] = useState(null)
    const [gitStatus, setGitStatus] = useState()
    const [isSyncing, setIsSyncing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [reverting, setReverting] = useState(false)

    const refreshGitStatus = async (sourceInfo) => {
        const status = await api.gitFetchStatus(sourceInfo.name)
        setGitStatus(status)
    }

    const syncButtonHandle = async () => {
        setIsSyncing(true)
        const status = await api.gitSync(sourceInfo.name, sourceInfo.branch)
        setGitStatus(status)
        setIsSyncing(false)
    }

    const revertButtonHandle = async () => {
        setReverting(true)
        await api.gitRevertChanges(sourceInfo.name)
        await refreshGitStatus(sourceInfo)
        setReverting(false)
    }

    useMemo(async () => {
        if (!sources) {
            setLoading(true)
            await refreshSources()
            setLoading(false)
        } else {
            const sourceInfo = sources.find(x => x.name === sourceName)
            if (sourceInfo) {
                setSourceInfo(sourceInfo)
                refreshGitStatus(sourceInfo)
            }
        }
    }, [refreshSources, sourceName, sources])

    return <MultiLevelPageContainer level={3}>
        {
            loading &&
            <Spinner />
        }
        {
            !loading && sourceInfo &&
            <>
                <div className="flex flex:col">
                    <div className="mb:8">
                        {t('General')}
                    </div>
                    <div className="mb:24 grid grid-cols:1 gap:4">
                        <CommonItem
                            title={t('Sync')}
                            footer={
                                !!gitStatus?.current &&
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
                                        {gitStatus?.current}
                                    </div>
                                </div>
                            }
                            end={
                                <Button onClick={syncButtonHandle} >
                                    <GitStatus gitStatus={gitStatus} isSyncing={isSyncing} />
                                </Button>
                            }
                        ></CommonItem>
                        <CommonItem
                            title={t('Revert all changes')}
                            desc={
                                !!gitStatus?.ahead && formatString(t('Revert {0} unsynced changes'), gitStatus?.ahead)
                            }
                            end={
                                <Button onClick={revertButtonHandle} disabled={!gitStatus?.ahead} >
                                    {reverting && <Spinner appearance="inverted" size="tiny" />}
                                    {!reverting && t('Revert')}
                                </Button>
                            }
                        ></CommonItem>
                    </div>
                    <div className="mb:8">
                        {t('Content')}
                    </div>
                    <div className="mb:24 grid grid-cols:1 gap:4">
                        <CommonItem
                            onClick={() => navigate('./module')}
                            icon={modIcon}
                            title={t('Module')}
                            end={chevronRightIcon}
                        ></CommonItem>
                    </div>
                </div>
            </>
        }
    </MultiLevelPageContainer>
}