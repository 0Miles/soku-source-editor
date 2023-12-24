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

import { marked } from 'marked'
import { getI18nProperty } from '../../../../common/i18n-property'
import { useTranslation } from 'react-i18next'
import EditVersionContentDialog from '../version/edit-version-content.dialog'
import EditVersionDownloadLinksDialog from '../version/edit-version-download-links.dialog'
import VersionDownloadLink from '../version/version-download-link'
import ReleaseVersionDialog from './release-version.dialog'
import renderer from '../../../../common/markdown-link-renderer'

export default function VersionListItem({ sourceName, modInfo, defaultVersionInfo, defaultOpen, allowOpen, refreshModInfo }) {
    const { primarySourceName } = useShared()
    const { t, i18n } = useTranslation()
    const [versionInfo, setVersionInfo] = useState(defaultVersionInfo)

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
            !versionInfo.downloadLinks?.length && t('Not yet released')
        }
        content={<>
            <div className="flex align-items:center justify-content:space-between">
                <div className="mr:16 my:2>div">
                    <div>
                        {t('Release on repository')}
                    </div>
                    {
                        !versionInfo.moduleFiles?.children?.length &&
                        <div className="f:12 line-height:1rem color:#CFCFCF@dark color:#565656@light">
                            {t('Requires import module files')}
                        </div>
                    }
                </div>
                <ReleaseVersionDialog
                    sourceName={sourceName}
                    modInfo={modInfo}
                    versionInfo={versionInfo}
                    disabled={!versionInfo.moduleFiles?.children?.length}
                    onCompleted={(newDownloadLinks) => {
                        setVersionInfo({
                            ...versionInfo,
                            downloadLinks: [...versionInfo.downloadLinks ?? [], ...newDownloadLinks]
                        })
                        refreshModInfo()
                    }}
                />
            </div>
            <div>
                <div className="flex align-items:center justify-content:space-between">
                    <div className="mr:16 my:2>div">
                        <div>
                            {t('Download links')}
                        </div>
                        <div className="f:12 line-height:1rem color:#CFCFCF@dark color:#565656@light">
                            {
                                !versionInfo.downloadLinks?.length &&
                                t('No download link has been released yet')
                            }
                        </div>
                    </div>
                    <EditVersionDownloadLinksDialog
                        sourceName={sourceName ?? primarySourceName}
                        moduleName={modInfo.name}
                        versionInfo={versionInfo}
                        onCompleted={(data) => {
                            setVersionInfo({
                                ...versionInfo,
                                ...data
                            })
                        }} />
                </div>
                {
                    !!versionInfo.downloadLinks?.length &&
                    <div className="mt:16">
                        {
                            versionInfo.downloadLinks?.map(
                                (downloadLink, i) => <VersionDownloadLink key={i} downloadLink={downloadLink} />
                            )
                        }
                    </div>
                }
            </div>
            <div>
                <div className="flex align-items:center justify-content:space-between mb:16">
                    <div>
                        {t('Release notes')}
                    </div>
                    <EditVersionNotesDialog
                        sourceName={sourceName ?? primarySourceName}
                        moduleName={modInfo.name}
                        versionInfo={versionInfo}
                        onCompleted={(data) => {
                            setVersionInfo({
                                ...versionInfo,
                                notes: data.notes,
                                notesI18n: data.notesI18n
                            })
                        }} />
                </div>
                <div className="r:3 my:8>p color:#5db0d7>*>a@dark color:blue>*>a@light user-select:text">
                    {
                        HTMLReactParser(
                            marked.parse(getI18nProperty(versionInfo, 'notes', i18n.language), { renderer })
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
                        versionInfo={versionInfo}
                        onCompleted={(data) => {
                            setVersionInfo({
                                ...versionInfo,
                                ...data
                            })
                        }} />
                </div>
                <div className="grid grid-template-cols:max-content|4|auto gap:8">
                    <div className="grid-col:1">
                        {t('Main file')}:
                    </div>
                    <div className="grid-col:3 f:16 color:#CFCFCF@dark user-select:text">
                        {versionInfo.main}
                    </div>
                    <div className="grid-col:1">
                        {t('Config files')}:
                    </div>
                    <div className="grid-col:3 f:16 color:#CFCFCF@dark user-select:text">
                        {
                            !!versionInfo.configFiles?.length &&
                            versionInfo.configFiles.map((fileName, i) => <div key={i}>{fileName}</div>)
                        }
                    </div>
                    <div className="grid-col:1 mt:8">
                        {t('All files')}:
                    </div>
                    <div className="grid-col:3 mt:8 f:14 color:#CFCFCF@dark user-select:text">
                        {
                            !!versionInfo.moduleFiles?.children?.length &&
                            <DirectoryTreeView className="bg:#141414@dark bg:#f5f5f5@light r:3 p:4 ml:-8" folder={versionInfo.moduleFiles} />
                        }
                        {
                            !versionInfo.moduleFiles?.children?.length &&
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
                            !!versionInfo.moduleFiles?.children?.length &&
                            t('Generates a zip file that can be imported in SokuLauncher')}
                        {
                            !versionInfo.moduleFiles?.children?.length &&
                            t('Requires import module files')
                        }
                    </div>
                </div>
                <Button onClick={() => api.exportZip(sourceName, modInfo.name, versionInfo.version)} disabled={!versionInfo.moduleFiles?.children?.length}>{t('Export')}</Button>
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
                                !versionInfo.downloadLinks?.length &&
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
                        disabled={!versionInfo.downloadLinks?.length}>
                        {t('Set')}
                    </Button>
                </div>
            }
        </>
        }
    />
}