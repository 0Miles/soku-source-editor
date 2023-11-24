import {
    Button,
    Spinner,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Label
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import * as api from '../../../common/api'
import Dropzone from '../../../common/dropzone'
import DirectoryTreeView from '../../../common/directory-tree-view'
import ComboBox from '../../../common/combo-box'

export default function EditVersionContentDialog({ sourceName, moduleName, versionInfo, onCompleted }) {
    const { t } = useTranslation()
    const { register, handleSubmit, reset, formState } = useForm({
        mode: 'all'
    })
    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [isDropFileLoading, setIsDropFileLoading] = useState(false)
    const [doingMessage, setDoingMessage] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const [recommendedMainFile, setRecommendedMainFile] = useState('')
    const [selectedConfigFiles, setSelectedConfigFiles] = useState([])

    const [moduleFiles, setModuleFiles] = useState()
    const [moduleFilesDirty, setModuleFilesDirty] = useState(false)
    const [moduleFilesTopLevelFilenames, setModuleFilesTopLevelFilenames] = useState([])

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)

        setRecommendedMainFile(versionInfo.main)
        setSelectedConfigFiles(versionInfo.configFiles)
        setModuleFiles(versionInfo.moduleFiles)
        setModuleFilesDirty(false)

        reset()
        setOpen(true)
    }

    const handleSubmitAction = async (data) => {
        setIsDoing(true)
        try {
            setDoingMessage(t('Updating version information file...'))
            await api.updateModVersion(sourceName, moduleName, versionInfo.version, {
                ...data,
                configFiles: selectedConfigFiles
            })

            if (moduleFiles?.children && moduleFilesDirty) {
                setDoingMessage(t('Copying module files...'))
                await api.copyModVersionFiles(moduleFiles?.children, sourceName, moduleName, versionInfo.version)
            }

            setOpen(false)
            const complatedData = {
                ...data,
                configFiles: selectedConfigFiles,
                moduleFiles
            }
            onCompleted && onCompleted(complatedData)
        }
        catch (ex) {
            setErrorMsg(ex.message)
            setIsDoing(false)
        }
    }

    useMemo(() => {
        const topLevelFiles = moduleFiles?.children.filter(x => x.type === 'file').map(x => x.name) ?? []
        setModuleFilesTopLevelFilenames(topLevelFiles)
    }, [moduleFiles])

    const moduleFilesDropHandle = async (files) => {
        setIsDropFileLoading(true)
        const filenames = files.map(x => x.path)
        let filesTree = await api.getFilesTree(filenames)
        if (filesTree.length === 1 && filesTree[0].type === 'directory') {
            filesTree = filesTree[0]
        } else {
            filesTree = {
                name: '',
                children: filesTree
            }
        }
        
        setModuleFiles(filesTree)
        setModuleFilesDirty(true)
        setIsDropFileLoading(false)
    }

    return <Dialog open={open}>
        <DialogTrigger>
            <Button onClick={openDialog}>{t('Edit')}</Button>
        </DialogTrigger>
        <DialogSurface>
            <form onSubmit={handleSubmit(handleSubmitAction)}>
                <DialogBody>
                    <DialogTitle className="user-select:none">
                        v{versionInfo.version} - {t('Content')}
                    </DialogTitle>
                    <DialogContent>
                        {
                            !isDoing && !errorMsg &&
                            <div className="flex flex:col pr:8 mb:16 mt:16>label mb:8>label">
                                <Label htmlFor="notes">
                                    {t('Module files')}
                                </Label>
                                <Dropzone
                                    onDrop={moduleFilesDropHandle}>
                                    {
                                        ({ isDragActive }) =>
                                            <div tabIndex={0} className={`${isDragActive ? 'b:2 bg:gray/.2!' : ''} ~border-color|.3s,background-color|.3s bg:#141414@dark bg:#f5f5f5@light b:0|dashed|gray r:3 flex justify-content:center align-items:center rel overflow:clip`}>
                                                {
                                                    isDropFileLoading && <Spinner className="abs top:0 my:8 @transition-down|.3s" size="tiny" />
                                                }
                                                {
                                                    !moduleFiles &&
                                                    <span className={`${isDragActive ? '' : 'opacity:.5'} ~opacity|.3s flex justify-content:center align-items:center pointer-events:none min-h:128`}>
                                                        {t('Drag and drop module directory or files here')}
                                                    </span>
                                                }
                                                {
                                                    moduleFiles &&
                                                    <DirectoryTreeView className="w:full p:8 pointer-events:none:drop" folder={moduleFiles} />
                                                }
                                            </div>
                                    }
                                </Dropzone>


                                <Label htmlFor="main">
                                    {t('Main file')}
                                    <span className="color:red">*</span>
                                </Label>
                                <ComboBox
                                    id="main"
                                    defaultValue={recommendedMainFile}
                                    options={moduleFilesTopLevelFilenames}
                                    freeform
                                    comboboxProps={({
                                        ...register('main', { required: true })
                                    })}
                                />

                                <Label htmlFor="configFiles">
                                    {t('Config files')}
                                </Label>
                                <ComboBox
                                    id="configFiles"
                                    defaultSelected={selectedConfigFiles}
                                    options={moduleFilesTopLevelFilenames}
                                    onOptionSelect={(_, data) => {
                                        setSelectedConfigFiles(data.selectedOptions)
                                    }}
                                    multiselect
                                />
                            </div>
                        }
                        {
                            isDoing &&
                            <div className="flex flex:col overflow:clip">
                                <Spinner />
                                <div className="center my:16">
                                    {doingMessage}
                                </div>
                            </div>
                        }
                        {
                            !!errorMsg &&
                            <div className="mt:16">
                                {t('An error occurred')}
                                <div className="max-h:120 bg:gray-10@dark bg:gray-90 r:3 mt:8 mb:16 p:16 overflow:auto">
                                    {errorMsg}
                                </div>
                            </div>
                        }
                    </DialogContent>

                    <DialogActions className="user-select:none">
                        {
                            !isDoing && !errorMsg &&
                            <>
                                <Button as="button" type="submit" appearance="primary" disabled={!formState.isValid}>{t('Edit')}</Button>
                                <Button onClick={() => setOpen(false)} appearance="subtle">{t('Cancel')}</Button>
                            </>
                        }
                        {
                            errorMsg &&
                            <>
                                <Button onClick={() => setOpen(false)} appearance="primary">{t('OK')}</Button>
                            </>
                        }
                    </DialogActions>
                </DialogBody>
            </form>
        </DialogSurface>
    </Dialog>
}