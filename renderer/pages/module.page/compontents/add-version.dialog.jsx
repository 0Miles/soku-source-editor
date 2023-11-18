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
    Input,
    Label,
    Textarea,
    Switch
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as api from '../../../common/api'
import Dropzone from '../../../common/dropzone'

import plusIcon from '../../../icons/plus.icon'
import DirectoryTreeView from '../../../common/directory-tree-view'
import ComboBox from '../../../common/combo-box'

export default function AddVersionDialog({ sourceName, moduleName, modVersions, onCompleted }) {
    const { t } = useTranslation()
    const { register, handleSubmit, reset, formState } = useForm({
        mode: 'all'
    })
    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [doingMessage, setDoingMessage] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const [recommendedVersionNumber, setRecommendedVersionNumber] = useState('')
    const [recommendedMainFile, setRecommendedMainFile] = useState('')
    const [selectedConfigFiles, setSelectedConfigFiles] = useState([])

    const [modFiles, setModFiles] = useState()
    const [modFilesTopLevelFilenames, setModFilesTopLevelFilenames] = useState([])

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)

        const lastVersionNumber = modVersions[0]?.version ?? '0.0.0'
        const lastNum = parseInt(lastVersionNumber.match(/(\d+)([\w]*)$/)[0] ?? '0')
        setRecommendedVersionNumber(lastVersionNumber.replace(/(\d+)([\w]*)$/, lastNum + 1 + '$2'))
        setRecommendedMainFile(modVersions[0]?.main ?? '')
        setSelectedConfigFiles(modVersions[0]?.configFiles ?? [])
        setModFiles()
        setModFilesTopLevelFilenames([])

        reset()
        setOpen(true)
    }

    const handleAddVersion = async (data) => {
        setIsDoing(true)
        try {
            if (modFiles?.children) {
                setDoingMessage(t('Copying module files...'))
                await api.copyModVersionFiles(modFiles?.children, sourceName, moduleName, data.version)
            }

            setDoingMessage(t('Generating version information file...'))
            await api.addModVersion(sourceName, moduleName, data.version, JSON.stringify({
                ...data,
                configFiles: selectedConfigFiles
            }))

            setOpen(false)
            onCompleted && onCompleted()
        }
        catch (ex) {
            setErrorMsg(ex.message)
            setIsDoing(false)
        }
    }

    const validateVersion = (value) => {
        return !modVersions?.find(x => x.version === value)
    }

    const moduleFilesDropHandle = async (files) => {
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

        const topLevelFiles = filesTree.children.filter(x => x.type === 'file').map(x => x.name)
        setModFilesTopLevelFilenames(topLevelFiles)
        if (!recommendedMainFile || !topLevelFiles.includes(recommendedMainFile)) {
            const dllFiles = topLevelFiles.filter(x => x.toLowerCase().endsWith('.dll'))
            if (dllFiles?.length === 1) {
                setRecommendedMainFile(dllFiles[0])
            } else {
                setRecommendedMainFile()
            }
        }

        let newSelectedConfigFiles = selectedConfigFiles.filter(x => topLevelFiles.includes(x))
        if (!newSelectedConfigFiles?.length) {
            newSelectedConfigFiles = topLevelFiles.filter(x => x.toLowerCase().endsWith('.ini'))
        }
        setSelectedConfigFiles([...newSelectedConfigFiles])
        setModFiles(filesTree)
    }

    return <Dialog open={open}>
        <DialogTrigger>
            <Button onClick={openDialog} icon={plusIcon}>{t('Add Version')}</Button>
        </DialogTrigger>
        <DialogSurface>
            <form onSubmit={handleSubmit(handleAddVersion)}>
                <DialogBody>
                    <DialogTitle className="user-select:none">
                        {t('Add Version')}
                    </DialogTitle>
                    <DialogContent>
                        {
                            !isDoing && !errorMsg &&
                            <div className="flex flex:col pr:8 mb:16 mt:16>label mb:8>label">
                                <Label htmlFor="version">
                                    {t('Version')}
                                    <span className="color:red">*</span>
                                </Label>
                                <Input id="version" defaultValue={recommendedVersionNumber} {...register('version', { required: 'Version is required', validate: validateVersion })} appearance="filled-darker" placeholder={recommendedVersionNumber} />
                                <Label htmlFor="notes">
                                    {t('Release Notes')}
                                </Label>
                                <Textarea id="notes" {...register('notes')} resize="vertical" appearance="filled-darker" />

                                <Label htmlFor="notes">
                                    {t('Module files')}
                                </Label>
                                <Dropzone
                                    onDrop={moduleFilesDropHandle}>
                                    {
                                        ({ isDragActive }) =>
                                            <div className={`${isDragActive ? 'b:gray bg:gray/.2!' : ''} ~border-color|.3s,background-color|.3s bg:#141414@dark bg:#f5f5f5@light b:2|dashed|transparent r:3`}>
                                                {
                                                    !modFiles &&
                                                    <span className={`${isDragActive ? '' : 'opacity:.5'} ~opacity|.3s min-h:128 flex justify-content:center align-items:center pointer-events:none`}>
                                                        {t('Drag and drop module directory or files here')}
                                                    </span>
                                                }
                                                {
                                                    modFiles &&
                                                    <DirectoryTreeView className="w:full" folder={modFiles} />
                                                }
                                            </div>
                                    }
                                </Dropzone>

                                {
                                    modFiles &&
                                    <>
                                        <Label htmlFor="main">
                                            {t('Main file')}
                                            <span className="color:red">*</span>
                                        </Label>
                                        <ComboBox
                                            id="main"
                                            defaultValue={recommendedMainFile}
                                            options={modFilesTopLevelFilenames}
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
                                            options={modFilesTopLevelFilenames}
                                            onOptionSelect={(_, data) => {
                                                setSelectedConfigFiles(data.selectedOptions)
                                            }}
                                            multiselect
                                        />
                                    </>
                                }
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
                                <Button as="button" type="submit" appearance="primary" disabled={!formState.isValid}>{t('Add')}</Button>
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