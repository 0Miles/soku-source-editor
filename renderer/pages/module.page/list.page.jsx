import {
    Button,
    Spinner
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useCallback, useMemo, useRef, useState } from 'react'
import MultiLevelPageContainer from '../../templates/multi-level-page-container'
import plusIcon from '../../icons/plus.icon'
import chevronRightIcon from '../../icons/chevron-right.icon'
import gearIcon from '../../icons/gear.icon'
import trashIcon from '../../icons/trash.icon'
import I18nProperty, { getI18nProperty } from '../../common/i18n-property'
import { useShared } from '../../contexts/shared'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import CommonItem from '../../common/common-item'
import AddModuleDialog from './compontents/add-module.dialog'
import SelectableList from '../../common/selectable-list'
import { useMessageBox, MessageBoxButtons, MessageBoxIcon, DialogResult } from '../../contexts/message-box'
import { nanoid } from 'nanoid'
import HTMLReactParser from 'html-react-parser'
import { marked } from 'marked'
import renderer from '../../common/markdown-link-renderer'
import innerText from 'react-innertext'

export default function ModuleListPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { sourceName } = useParams()
    const { primarySourceName } = useShared()
    const { t, i18n } = useTranslation()
    const { showMessageBox } = useMessageBox()

    const selectedModsRef = useRef([])
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
        setMods(await window.ipcApi.getMods(sourceName ?? primarySourceName))
        setLoading(false)
    }, [primarySourceName, sourceName])

    useMemo(async () => {
        if (location?.pathname.match(/.*module\/?$/)) {
            refreshMods()
        }
    }, [location, refreshMods])

    const deleteSelectedMod = async () => {
        if (!selectedModsRef.current?.length) return
        if (
            await showMessageBox(
                t('Delete module'),
                <div>
                    {t('Do you want to delete these mods')}
                    {
                        selectedModsRef.current.map((selectedMod, index) =>
                            <span key={index} className="p:4 ml:4 r:3 bg:gray-10@dark bg:gray-90@light">{selectedMod.name}</span>
                        )
                    }
                    ?
                </div>,
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question) === DialogResult.Yes
        ) {
            try {
                for (const selectedMod of selectedModsRef.current) {
                    await window.ipcApi.deleteMod(sourceName ?? primarySourceName, selectedMod.name)
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
            refreshMods()
        }
    }

    const selectedModsChangeHandle = useCallback((selected) => {
        selectedModsRef.current = selected
    }, [])

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
            !!(primarySourceName || sourceName) &&
            <>
                <SelectableList
                    loading={loading}
                    items={mods}
                    itemTemplate={
                        (modInfo, selectMode) => {
                            return <CommonItem
                                onClick={() => { if (!selectMode) navigate(`./info/${modInfo.name}`) }}
                                fullIcon="true"
                                icon={
                                    <>
                                        {
                                            !!modInfo.icon &&
                                            <img className="w:full h:full obj:cover"
                                                src={modInfo.icon + '?' + nanoid()}
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
                                desc={
                                    innerText(
                                        HTMLReactParser(
                                            marked.parse(getI18nProperty(modInfo, 'description', i18n.language), { renderer })
                                        )
                                    )
                                }
                                end={chevronRightIcon}
                            />
                        }
                    }
                    toolbar={
                        <AddModuleDialog sourceName={sourceName ?? primarySourceName} sourceMods={mods} onCompleted={refreshMods} />
                    }
                    selectModeToolbar={
                        <Button onClick={deleteSelectedMod} icon={trashIcon}>{t('Delete')}</Button>
                    }
                    selectedChange={selectedModsChangeHandle}
                />
            </>
        }
    </MultiLevelPageContainer>
}