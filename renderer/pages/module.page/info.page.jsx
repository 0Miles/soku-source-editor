import {
    Spinner,
    Button
} from '@fluentui/react-components'
import { useState, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageContainer from '../../templates/page-container'

import plusIcon from '../../icons/plus.icon'
import pencilIcon from '../../icons/pencil.icon'
import trashIcon from '../../icons/trash.icon'
import gearIcon from '../../icons/gear.icon'
import boxIcon from '../../icons/box.icon'
import chevronUpIcon from '../../icons/chevron-up.icon'
import chevronDownIcon from '../../icons/chevron-down.icon'

import * as api from '../../common/api'
import CollapsibleItem from '../../common/collapsible-item'
import HTMLReactParser from 'html-react-parser'
import { Marked, Renderer } from 'marked'
import I18nProperty, { getI18nProperty } from '../../common/i18n-property'
import SelectableList from '../../common/selectable-list'
import { useModSource } from '../../contexts/mod-source'

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

    const [loading, setLoading] = useState(false)
    const [versionsLoading, setVersionsLoading] = useState(false)
    const [modInfo, setModInfo] = useState(null)
    const [versions, setVersions] = useState([])
    const [open, setOpen] = useState(false)
    const selectedVersionRef = useRef([])

    useMemo(async () => {
        setLoading(true)
        setModInfo(await api.getMod(sourceName ?? primarySourceName, modName))
        setLoading(false)
    }, [modName, primarySourceName, sourceName])

    useMemo(async () => {
        setVersionsLoading(true)
        setVersions(await api.getModVersions(sourceName ?? primarySourceName, modName))
        setVersionsLoading(false)
    }, [modName, primarySourceName, sourceName])

    return <PageContainer>
        {
            loading &&
            <Spinner />
        }
        {
            !loading && !!modInfo &&
            <>
                <div className={`rel w:full pt:30 px:24 user-select:none`}>
                    {
                        !!modInfo.banner &&
                        <img src={modInfo.banner} className="abs z:-1 border-radius:6|6|0|0 top:0 left:0 w:full h:full max-h:250 object-fit:cover" />
                    }
                    <div className="abs z:-1 border-radius:6|6|0|0 top:0 left:-1 w:calc(100%+2px) h:full max-h:250 bg:linear-gradient(rgba(0,0,0,.65)|0%,rgba(32,32,32,.9)|60%,rgba(32,32,32,1)|75%)@dark bg:linear-gradient(rgba(200,200,200,.65)|0%,rgba(255,255,255,.85)|60%,rgba(255,255,255,1)|75%)@light"></div>
                    <div className="flex w:full align-items:center justify-content:center">
                        <div className="flex aspect:1/1 flex:0|0|120px h:full overflow:hidden align-items:center justify-content:center bg:gray/.2">
                            {
                                !!modInfo.icon &&
                                <img src={modInfo.icon} className="obj:cover w:full h:full" />
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
                        <Button className="abs top:60 right:35" icon={pencilIcon}></Button>
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
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                                <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path>
                                            </svg>
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
                        (version, selectMode) => {
                            return <CollapsibleItem
                                allowOpen={!selectMode}
                                className={`w:full`}
                                icon={boxIcon}
                                title={`v${version.version}`}
                                desc={t('Not yet released')}
                                content={<>
                                    <div>
                                        <div className="flex align-items:center justify-content:space-between mb:16">
                                            <div>
                                                {t('Content')}
                                            </div>
                                            <Button>{t('Edit')}</Button>
                                        </div>
                                        <div className="grid grid-template-cols:max-content|4|auto gap:8">
                                            <div className="grid-col:1">
                                                {t('Main file')}:
                                            </div>
                                            <div className="grid-col:3 f:16 color:#CFCFCF@dark user-select:text">
                                                {version.main}
                                            </div>
                                            <div className="grid-col:1">
                                                {t('Config files')}:
                                            </div>
                                            <div className="grid-col:3 f:16 color:#CFCFCF@dark user-select:text">
                                                {
                                                    !!version.configFiles?.length &&
                                                    version.configFiles.map((fileName, i) => <div key={i}>{fileName}</div>)
                                                }
                                            </div>
                                            <div className="grid-col:1">
                                                {t('Location')}:
                                            </div>
                                            <div className="grid-col:3 f:14 color:#CFCFCF@dark user-select:text">
                                                {
                                                    version.dirname
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex align-items:center justify-content:space-between">
                                        <div className="mr:16 my:2>div">
                                            <div>
                                                {t('Release on Github')}
                                            </div>
                                            <div className="f:12 line-height:1rem color:#CFCFCF@dark color:#565656@light">
                                                {t(`Requires logging in and setting up the module's Github Repository`)}
                                            </div>
                                        </div>
                                        <Button disabled>{t('Release')}</Button>
                                    </div>
                                    <div>
                                        <div className="mb:16">{t('Release Notes')}</div>
                                        <div className="r:3 my:8>p color:#5db0d7>*>a@dark color:blue>*>a@light user-select:text">
                                            {
                                                HTMLReactParser(
                                                    marked.parse(getI18nProperty(version, 'notes', i18n.language))
                                                )
                                            }
                                        </div>
                                    </div>
                                    <div className="flex align-items:center justify-content:space-between">
                                        <div className="mr:16 my:2>div">
                                            <div>
                                                {t('Export compressed file')}
                                            </div>
                                            <div className="f:12 line-height:1rem color:#CFCFCF@dark color:#565656@light">
                                                {t('Generates a zip file that can be imported in SokuLauncher')}
                                            </div>
                                        </div>
                                        <Button>{t('Export')}</Button>
                                    </div>
                                </>
                                }
                            />
                        }
                    }
                    toolbar={
                        <Button icon={plusIcon}>{t('Add version')}</Button>
                    }
                    selectModeToolbar={
                        <Button icon={trashIcon}>{t('Delete')}</Button>
                    }
                    selectedChange={
                        (selected) => {
                            selectedVersionRef.current = selected
                        }
                    }
                />
            </>
        }
    </PageContainer>
}