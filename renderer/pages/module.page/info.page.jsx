import {
    Spinner,
    Button
} from '@fluentui/react-components'
import { useState, useMemo, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../templates/page-container'

import trashIcon from '../../icons/trash.icon'
import gearIcon from '../../icons/gear.icon'
import chevronUpIcon from '../../icons/chevron-up.icon'
import chevronDownIcon from '../../icons/chevron-down.icon'
import githubIcon from '../../icons/github.icon'

import * as api from '../../common/api'
import { Marked, Renderer } from 'marked'
import I18nProperty from '../../common/i18n-property'
import SelectableList from '../../common/selectable-list'
import { useModSource } from '../../contexts/mod-source'
import { useMessageBox, MessageBoxButtons, MessageBoxIcon, DialogResult } from '../../contexts/message-box'
import AddVersionDialog from './compontents/add-version.dialog'
import EditModuleDialog from './compontents/edit-module.dialog'
import { nanoid } from 'nanoid'
import VersionListItem from './compontents/version.list-item'

const renderer = new Renderer()
const linkRenderer = renderer.link
renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
}
const marked = new Marked({ renderer })

export default function ModuleInfoPage() {
    const { primarySourceName } = useModSource()
    const { sourceName, modName } = useParams()
    const { t, i18n } = useTranslation()
    const { showMessageBox } = useMessageBox()

    const [loading, setLoading] = useState(false)
    const [versionsLoading, setVersionsLoading] = useState(false)
    const [modInfo, setModInfo] = useState(null)
    const [versions, setVersions] = useState([])
    const [open, setOpen] = useState(false)
    const selectedVersionsRef = useRef([])

    const refreshModInfo = useCallback(async () => {
        setLoading(true)
        setModInfo(await api.getMod(sourceName ?? primarySourceName, modName))
        setLoading(false)
    }, [modName, primarySourceName, sourceName])

    useMemo(() => {
        refreshModInfo()
    }, [refreshModInfo])

    const refreshVersions = useCallback(async () => {
        setVersionsLoading(true)
        setVersions(await api.getModVersions(sourceName ?? primarySourceName, modName))
        setVersionsLoading(false)
    }, [modName, primarySourceName, sourceName])

    useMemo(() => {
        refreshVersions()
    }, [refreshVersions])

    const selectedVersionChangeHandle = useCallback((selected) => {
        selectedVersionsRef.current = selected
    }, [])

    const deleteSelectedVersions = async () => {
        if (!selectedVersionsRef.current?.length) return
        if (
            await showMessageBox(
                t('Delete version'),
                <div>
                    {t('Do you want to delete these versions')}
                    {
                        selectedVersionsRef.current.map((selectedVersion, index) =>
                            <span key={index} className="p:4 ml:4 r:3 bg:gray-10@dark bg:gray-90@light">v{selectedVersion.version}</span>
                        )
                    }
                    ?
                </div>,
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question) === DialogResult.Yes
        ) {
            try {
                for (const selectedVersion of selectedVersionsRef.current) {
                    await api.deleteModVersion(sourceName ?? primarySourceName, modInfo.name, selectedVersion.version)
                }
            } catch (ex) {
                showMessageBox(
                    t('An error occurred'),
                    <div className="max-h:120 bg:gray-10@dark bg:gray-90 r:3 mt:8 mb:16 p:16 overflow:auto">
                        {ex.message}
                    </div>,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error)
            }
            refreshVersions()
            refreshModInfo()
        }
    }

    return <PageContainer>
        
        {
            loading &&
            <div className="flex justify-content:center">
                <Spinner className="abs mt:24 @transition-down|.3s" />
            </div>
        }
        {
            !!modInfo &&
            <>
                <div className={`rel w:full pt:30 px:24 user-select:none`}>
                    {
                        !!modInfo.banner &&
                        <img src={modInfo.banner + '?' + nanoid()} className="abs z:-1 border-radius:6|6|0|0 top:0 left:0 w:full h:full max-h:250 object-fit:cover" />
                    }
                    <div className="abs z:-1 border-radius:6|6|0|0 top:0 left:-1 w:calc(100%+2px) h:full max-h:250 bg:linear-gradient(rgba(0,0,0,.65)|0%,rgba(32,32,32,.9)|60%,rgba(32,32,32,1)|75%)@dark bg:linear-gradient(rgba(200,200,200,.65)|0%,rgba(255,255,255,.85)|60%,rgba(255,255,255,1)|75%)@light"></div>
                    <div className="flex w:full align-items:center justify-content:center">
                        <div className="flex aspect:1/1 flex:0|0|120px h:full overflow:hidden align-items:center justify-content:center bg:gray/.2">
                            {
                                !!modInfo.icon &&
                                <img src={modInfo.icon + '?' + nanoid()} className="obj:cover w:full h:full" />
                            }
                            {
                                !modInfo.icon &&
                                <div className="flex w:full h:full align-items:center justify-content:center bg:gray/.2">
                                    {gearIcon}
                                </div>
                            }
                        </div>
                        <div className="flex flex:1 w:0 flex:col text-align:left mx:24 {white-space:nowrap;overflow:hidden;text-overflow:ellipsis}>div">
                            <div className="f:32 line-height:normal font-weight:bold">
                                {modInfo.name}
                            </div>
                            <div className="my:8 font-weight:normal">
                                <I18nProperty root={modInfo} property={'description'} lang={i18n.language} />
                            </div>
                        </div>
                        <EditModuleDialog
                            sourceName={sourceName ?? primarySourceName}
                            modInfo={modInfo}
                            className="abs top:60 right:35"
                            onCompleted={refreshModInfo} />
                    </div>

                    <div className={`overflow:hidden ~max-height|.5s|ease ${open ? 'max-h:350' : 'max-h:0'} flex flex-wrap:wrap`}>
                        <div className="flex flex:col flex:1">
                            <div className="mt:16 f:bold">
                                {t('Author')}
                            </div>
                            <div className="my:6">
                                {modInfo.author ?? t('Unknown')}
                            </div>
                        </div>
                        <div className="flex flex:col flex:1">
                            <div className="mt:16 f:bold">
                                {t('Module Priority')}
                            </div>
                            <div className="my:6">
                                {modInfo.priority ?? '0'}
                            </div>
                        </div>
                        <div className="flex flex:col w:full">
                            <div className="mt:16 f:bold">
                                {t('Repository')}
                            </div>
                            <div className="my:6 flex flex-wrap:wrap">
                                {
                                    !!modInfo.repository?.length &&
                                    modInfo.repository.map((repo, i) => <div key={i} className="flex align-items:center p:8">
                                        <div>
                                            {githubIcon}
                                        </div>
                                        <div className="ml:8">
                                            {repo.owner}/{repo.repo}
                                        </div>
                                    </div>)
                                }
                                {
                                    !modInfo.repository?.length &&
                                    <div>
                                        {t('No repository configured')}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex:col mt:8">
                    <Button onClick={() => setOpen(!open)} className="r:0|0|6|6!" appearance="subtle">
                        {
                            !open && chevronDownIcon
                        }
                        {
                            open && chevronUpIcon
                        }
                    </Button>
                </div>
                <SelectableList
                    className="mt:16"
                    loading={versionsLoading}
                    items={versions}
                    itemTemplate={
                        (versionInfo, selectMode, index) => {
                            
                            return <VersionListItem
                                defaultOpen={index === 0 && !versionInfo.downloadLinks?.length}
                                allowOpen={!selectMode}
                                className={`w:full`}
                                sourceName={sourceName ?? primarySourceName}
                                modInfo={modInfo}
                                versionInfo={versionInfo}
                                refreshModInfo={refreshModInfo}
                            />
                        }
                    }
                    toolbar={
                        <AddVersionDialog sourceName={sourceName ?? primarySourceName} moduleName={modInfo.name} modVersions={versions} onCompleted={refreshVersions} />
                    }
                    selectModeToolbar={
                        <Button onClick={deleteSelectedVersions} icon={trashIcon}>{t('Delete')}</Button>
                    }
                    selectedChange={selectedVersionChangeHandle}
                />
            </>
        }
    </PageContainer>
}