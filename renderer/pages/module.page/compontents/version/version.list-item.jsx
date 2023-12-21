import { useState } from 'react'
import {
    Button
} from '@fluentui/react-components'
import * as api from '../../../../common/api'
import { useShared } from '../../../../contexts/shared'
import CollapsibleItem from '../../../../common/collapsible-item'
import EditVersionNotesDialog from '../version/edit-version-notes.dialog'
import DirectoryTreeView from '../../../../common/directory-tree-view'
import HTMLReactParser from 'html-react-parser'

import boxIcon from '../../../../icons/box.icon'

import { Renderer, marked } from 'marked'
import { getI18nProperty } from '../../../../common/i18n-property'
import { useTranslation } from 'react-i18next'
import EditVersionContentDialog from '../version/edit-version-content.dialog'
import EditVersionDownloadLinksDialog from '../version/edit-version-download-links.dialog'
import VersionDownloadLink from '../version/version-download-link'

const renderer = new Renderer()
const linkRenderer = renderer.link
renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" rel="nofollow" ');
}

export default function VersionListItem({ sourceName, modInfo, versionInfo, defaultOpen, allowOpen, refreshModInfo }) {
    const { primarySourceName } = useShared()
    const { t, i18n } = useTranslation()
    const [versionInfoForDisplay, setVersionInfoForDisplay] = useState(versionInfo)

    return <CollapsibleItem
        defaultOpen={defaultOpen}
        allowOpen={allowOpen}
        className={`w:full`}
        icon={boxIcon}
        title={
            <>
                {`v${versionInfo.version}`}
                {
                    versionInfo.version === modInfo.recommendedVersionNumber &&
                    <svg className="mx:8 color:gold-80 fill:gold-80/.3" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"></path>
                    </svg>
                }
            </>
        }
        desc={
            !versionInfoForDisplay.downloadLinks?.length && t('Not yet released')
        }
        content={<>
            {
                !versionInfoForDisplay.downloadLinks?.find(x => x.type === 'github') &&
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
            }
            <div>
                <div className="flex align-items:center justify-content:space-between">
                    <div className="mr:16 my:2>div">
                        <div>
                            {t('Download links')}
                        </div>
                        <div className="f:12 line-height:1rem color:#CFCFCF@dark color:#565656@light">
                            {
                                !versionInfoForDisplay.downloadLinks?.length &&
                                t('No download link has been released yet')
                            }
                        </div>
                    </div>
                    <EditVersionDownloadLinksDialog
                        sourceName={sourceName ?? primarySourceName}
                        moduleName={modInfo.name}
                        versionInfo={versionInfoForDisplay}
                        onCompleted={(data) => {
                            setVersionInfoForDisplay({
                                ...versionInfoForDisplay,
                                ...data
                            })
                        }} />
                </div>
                {
                    !!versionInfoForDisplay.downloadLinks?.length &&
                    <div className="mt:16">
                        {
                            versionInfoForDisplay.downloadLinks?.map(
                                (downloadLink, i) => <VersionDownloadLink key={i} downloadLink={downloadLink} />
                            )
                        }
                    </div>
                }
            </div>
            <div>
                <div className="flex align-items:center justify-content:space-between mb:16">
                    <div>
                        {t('Release Notes')}
                    </div>
                    <EditVersionNotesDialog
                        sourceName={sourceName ?? primarySourceName}
                        moduleName={modInfo.name}
                        versionInfo={versionInfoForDisplay}
                        onCompleted={(data) => {
                            setVersionInfoForDisplay({
                                ...versionInfoForDisplay,
                                notes: data.notes
                            })
                        }} />
                </div>
                <div className="r:3 my:8>p color:#5db0d7>*>a@dark color:blue>*>a@light user-select:text">
                    {
                        HTMLReactParser(
                            marked.parse(getI18nProperty(versionInfoForDisplay, 'notes', i18n.language), { renderer })
                        )
                    }
                </div>
            </div>
            <div>
                <div className="flex align-items:center justify-content:space-between mb:16">
                    <div>
                        {t('Content')}
                    </div>
                    <EditVersionContentDialog
                        sourceName={sourceName ?? primarySourceName}
                        moduleName={modInfo.name}
                        versionInfo={versionInfoForDisplay}
                        onCompleted={(data) => {
                            setVersionInfoForDisplay({
                                ...versionInfoForDisplay,
                                ...data
                            })
                        }} />
                </div>
                <div className="grid grid-template-cols:max-content|4|auto gap:8">
                    <div className="grid-col:1">
                        {t('Main file')}:
                    </div>
                    <div className="grid-col:3 f:16 color:#CFCFCF@dark user-select:text">
                        {versionInfoForDisplay.main}
                    </div>
                    <div className="grid-col:1">
                        {t('Config files')}:
                    </div>
                    <div className="grid-col:3 f:16 color:#CFCFCF@dark user-select:text">
                        {
                            !!versionInfoForDisplay.configFiles?.length &&
                            versionInfoForDisplay.configFiles.map((fileName, i) => <div key={i}>{fileName}</div>)
                        }
                    </div>
                    <div className="grid-col:1 mt:8">
                        {t('All files')}:
                    </div>
                    <div className="grid-col:3 mt:8 f:14 color:#CFCFCF@dark user-select:text">
                        {
                            !!versionInfoForDisplay.moduleFiles?.children?.length &&
                            <DirectoryTreeView className="bg:#141414@dark bg:#f5f5f5@light r:3 p:4 ml:-8" folder={versionInfoForDisplay.moduleFiles} />
                        }
                        {
                            !versionInfoForDisplay.moduleFiles?.children?.length &&
                            t('Module files not imported')
                        }
                    </div>
                </div>
            </div>
            <div className="flex align-items:center justify-content:space-between">
                <div className="mr:16 my:2>div">
                    <div>
                        {t('Export compressed file')}
                    </div>
                    <div className="f:12 line-height:1rem color:#CFCFCF@dark color:#565656@light">
                        {
                            !!versionInfoForDisplay.moduleFiles?.children?.length &&
                            t('Generates a zip file that can be imported in SokuLauncher')}
                        {
                            !versionInfoForDisplay.moduleFiles?.children?.length &&
                            t('Requires import module files')
                        }
                    </div>
                </div>
                <Button onClick={() => api.exportZip(sourceName, modInfo.name, versionInfo.version)} disabled={!versionInfoForDisplay.moduleFiles?.children?.length}>{t('Export')}</Button>
            </div>
            {
                versionInfo.version !== modInfo.recommendedVersionNumber &&
                <div className="flex align-items:center justify-content:space-between">
                    <div className="mr:16 my:2>div">
                        <div>
                            {t('Set as recommended version')}
                        </div>
                        <div className="f:12 line-height:1rem color:#CFCFCF@dark color:#565656@light">
                            {
                                !versionInfoForDisplay.downloadLinks?.length &&
                                t(`Requires publish and get download link`)
                            }
                        </div>
                    </div>
                    <Button
                        onClick={
                            async () => {
                                await api.updateMod(sourceName ?? primarySourceName, modInfo.name, {
                                    recommendedVersionNumber: versionInfo.version
                                })
                                refreshModInfo()
                            }
                        }
                        disabled={!versionInfoForDisplay.downloadLinks?.length}>
                        {t('Set')}
                    </Button>
                </div>
            }
        </>
        }
    />
}