import { useState, useMemo } from 'react'
import {
    Button
} from '@fluentui/react-components'
import * as api from '../../../common/api'
import { useModSource } from '../../../contexts/mod-source'
import CollapsibleItem from '../../../common/collapsible-item'
import EditVersionNotesDialog from './edit-version-notes.dialog'
import DirectoryTreeView from '../../../common/directory-tree-view'
import HTMLReactParser from 'html-react-parser'
import boxIcon from '../../../icons/box.icon'
import { marked } from 'marked'
import { getI18nProperty } from '../../../common/i18n-property'
import { useTranslation } from 'react-i18next'

export default function VersionListItem({ sourceName, modInfo, versionInfo, defaultOpen, allowOpen, refreshModInfo }) {
    const { primarySourceName } = useModSource()
    const { t, i18n } = useTranslation()
    const [releaseNotes, setReleaseNotes] = useState(
        HTMLReactParser(
            marked.parse(getI18nProperty(versionInfo, 'notes', i18n.language))
        )
    )

    return <CollapsibleItem
        defaultOpen={defaultOpen}
        allowOpen={allowOpen}
        className={`w:full`}
        icon={boxIcon}
        title={
            <>
                {`v${versionInfo.version}`}
                {
                    versionInfo.version === modInfo.recommendedVersion &&
                    <svg className="mx:8 color:gold-80 fill:gold-80/.3" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z"></path>
                    </svg>
                }
            </>
        }
        desc={
            !versionInfo.downloadLink?.length && t('Not yet released')
        }
        content={<>
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
                <div className="flex align-items:center justify-content:space-between mb:16">
                    <div>
                        {t('Release Notes')}
                    </div>
                    <EditVersionNotesDialog
                        sourceName={sourceName ?? primarySourceName}
                        moduleName={modInfo.name}
                        versionInfo={versionInfo}
                        onCompleted={(data) => {
                            versionInfo.notes = data.notes
                            setReleaseNotes(
                                HTMLReactParser(
                                    marked.parse(getI18nProperty(versionInfo, 'notes', i18n.language))
                                )
                            )
                        }} />
                </div>
                <div className="r:3 my:8>p color:#5db0d7>*>a@dark color:blue>*>a@light user-select:text">
                    {
                        releaseNotes
                    }
                </div>
            </div>
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
                            <DirectoryTreeView className="bg:#141414@dark bg:#f5f5f5@light r:3 p:8 ml:-16" folder={versionInfo.moduleFiles} />
                        }
                        {
                            !versionInfo.moduleFiles?.children?.length &&
                            t('Module files not loaded')
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
                        {t('Generates a zip file that can be imported in SokuLauncher')}
                    </div>
                </div>
                <Button>{t('Export')}</Button>
            </div>
            {
                versionInfo.version !== modInfo.recommendedVersion &&
                <div className="flex align-items:center justify-content:space-between">
                    <div className="mr:16 my:2>div">
                        <div>
                            {t('Set as recommended version')}
                        </div>
                        <div className="f:12 line-height:1rem color:#CFCFCF@dark color:#565656@light">
                            {t(`Requires publish and get download link`)}
                        </div>
                    </div>
                    <Button
                        onClick={
                            async () => {
                                await api.updateMod(sourceName ?? primarySourceName, modInfo.name, {
                                    recommendedVersion: versionInfo.version
                                })
                                refreshModInfo()
                            }
                        }
                        disabled={!versionInfo.downloadLink?.length}>
                        {t('Set')}
                    </Button>
                </div>
            }
        </>
        }
    />
}