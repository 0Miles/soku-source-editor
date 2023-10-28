import {
    Button,
    MenuItem,
    Spinner,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Input,
    Label
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { getSources } from '../../common/api'
import { useCallback, useMemo, useState } from 'react'
import Temp from '../../temp'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'
import ListItemButton from '../../common/list-item.button'

import plusIcon from '../../icons/plus.icon'
import pencilIcon from '../../icons/pencil.icon'
import trashIcon from '../../icons/trash.icon'
import gearIcon from '../../icons/gear.icon'
import I18nProperty from '../../common/i18n-property'
import { cloneModSource } from '../../common/api'

export default function SourceListPage() {
    const { t, i18n } = useTranslation()

    const [loading, setLoading] = useState(false)
    const [sources, setSources] = useState([])
    const [sourceUrl, setSourceUrl] = useState('')

    const addSource = useCallback(async () => {
        const repo = await cloneModSource(sourceUrl)
        console.log(repo)
    }, [sourceUrl])

    useMemo(() => {
        (async () => {
            if (!Temp['sources']) {
                setLoading(true)
                const data = await getSources()
                setSources(data)
                setLoading(false)
            } else {
                setSources(Temp['sources'])
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
                                                        <div className="flex align-items:center">
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
                    <Dialog>
                        <DialogTrigger disableButtonEnhancement>
                            <Button onClick={() => { setSourceUrl('') }} className="w:full min-h:80 cursor:auto!" appearance="subtle">
                                {plusIcon}
                            </Button>
                        </DialogTrigger>
                        <DialogSurface>
                            <DialogBody>
                                <DialogTitle className="user-select:none">{t('Add source')}</DialogTitle>
                                <DialogContent>
                                    <div className="flex flex:col mb:16">
                                        <Input onChange={(_, data) => { setSourceUrl(data.value)}} id="repoUrl" appearance="filled-darker" placeholder="https://github.com/{owner}/{repo}.git" required />
                                    </div>
                                </DialogContent>
                                <DialogActions className="user-select:none">
                                    <DialogTrigger disableButtonEnhancement>
                                        <Button appearance="secondary">{t('Cancel')}</Button>
                                    </DialogTrigger>
                                    <Button onClick={addSource} appearance="primary">{t('Add')}</Button>
                                </DialogActions>
                            </DialogBody>
                        </DialogSurface>
                    </Dialog>
                </div>
            </>
        }
    </MultiLevelPageContainer>
}