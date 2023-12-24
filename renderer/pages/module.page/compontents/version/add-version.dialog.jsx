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

import plusIcon from '../../../../icons/plus.icon'

import * as api from '../../../../common/api'
import Dropzone from '../../../../common/dropzone'
import DirectoryTreeView from '../../../../common/directory-tree-view'
import ComboBox from '../../../../common/combo-box'

export default function AddVersionDialog({ sourceName, moduleName, modVersions, onCompleted }) {
    const { t } = useTranslation()
    const { register, handleSubmit, reset, formState } = useForm({
        mode: 'all'
    })
    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [isDropFileLoading, setIsDropFileLoading] = useState(false)
    const [doingMessage, setDoingMessage] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const [recommendedVersionNumber, setRecommendedVersionNumber] = useState('')
    const [recommendedMainFile, setRecommendedMainFile] = useState('')
    const [selectedConfigFiles, setSelectedConfigFiles] = useState([])

    const [moduleFiles, setModuleFiles] = useState()
    const [moduleFilesTopLevelFilenames, setModuleFilesTopLevelFilenames] = useState([])
    const [releaseImmediately, setReleaseImmediately] = useState(true)

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)

        const lastVersionNumber = modVersions[0]?.version ?? '0.0.0'
        const lastNum = parseInt(lastVersionNumber.match(/(\d+)([\w]*)$/)[0] ?? '0')
        setRecommendedVersionNumber(lastVersionNumber.replace(/(\d+)([\w]*)$/, lastNum + 1 + '$2'))
        setRecommendedMainFile(modVersions[0]?.main ?? '')
        setSelectedConfigFiles(modVersions[0]?.configFiles ?? [])
        setModuleFiles()
        setModuleFilesTopLevelFilenames([])
        setReleaseImmediately(true)

        reset()
        setOpen(true)
    }

    const handleSubmitAction = async (data) => {
        setIsDoing(true)
        try {
            setDoingMessage(t('Generating version information file...'))
            const versionInfo = {
                ...data,
                configFiles: selectedConfigFiles
            }
            await api.addModVersion(sourceName, moduleName, data.version, versionInfo)

            if (moduleFiles?.children) {
                setDoingMessage(t('Copying module files...'))
                await api.copyModVersionFiles(moduleFiles?.children, sourceName, moduleName, data.version)
            }

            setOpen(false)
            onCompleted && onCompleted({ releaseImmediately: moduleFilesTopLevelFilenames?.length && releaseImmediately, versionInfo })
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

        const topLevelFiles = filesTree.children.filter(x => x.type === 'file').map(x => x.name)
        setModuleFilesTopLevelFilenames(topLevelFiles)
        setModuleFiles(filesTree)
        setIsDropFileLoading(false)
    }

    return <Dialog open={open}>
        <DialogTrigger>
            <Button onClick={openDialog} icon={plusIcon}>{t('Add Version')}</Button>
        </DialogTrigger>
        <DialogSurface>
            <form onSubmit={handleSubmit(handleSubmitAction)}>
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
                                    {t('Release notes')}
                                </Label>
                                <Textarea id="notes" {...register('notes')} resize="vertical" appearance="filled-darker" />

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

                                <div className="mt:16 flex align-items:center justify-content:end user-select:none">
                                    <Switch id="releaseImmediately" checked={moduleFilesTopLevelFilenames?.length && releaseImmediately} disabled={!moduleFilesTopLevelFilenames?.length} onChange={(_, data) => setReleaseImmediately(data.checked)} />
                                    <label htmlFor="releaseImmediately">{t('Release immediately after creating the version')}</label>
                                </div>
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