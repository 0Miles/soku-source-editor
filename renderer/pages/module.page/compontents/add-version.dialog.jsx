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
    SpinButton,
    Textarea,
    Combobox,
    Option,
    Badge
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useState, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import * as api from '../../../common/api'

import plusIcon from '../../../icons/plus.icon'

export default function AddVersionDialog({ sourceName, moduleName, modVersions, onCompleted }) {
    const { t } = useTranslation()
    const { register, handleSubmit, reset, formState } = useForm({
        mode: 'all'
    })
    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [modFilenameList, setModFilenameList] = useState(['123'])
    const [recommendedVersionNumber, setRecommendedVersionNumber] = useState('')
    const [recommendedMainFile, setRecommendedMainFile] = useState('')
    const [selectedConfigFiles, setSelectedConfigFiles] = useState([])
    const [configFilesComboBoxOpen, setConfigFilesComboBoxOpen] = useState(false)

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)

        const lastVersionNumber = modVersions[0]?.version ?? '0.0.0'
        const lastNum = parseInt(lastVersionNumber.match(/(\d)([\w]*)$/)[0] ?? '0')
        setRecommendedVersionNumber(lastVersionNumber.replace(/(\d)([\w]*)$/, lastNum + 1 + '$2'))
        setRecommendedMainFile(modVersions[0]?.main ?? '')
        setSelectedConfigFiles(modVersions[0]?.configFiles ?? [])

        reset()
        setOpen(true)
    }

    const handleRegistration = async (data) => {
        setIsDoing(true)
        try {
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
    const handleError = (errors) => console.error(errors)

    const validateVersion = (value) => {
        return !modVersions?.find(x => x.version === value)
    }

    return <Dialog open={open}>
        <DialogTrigger>
            <Button onClick={openDialog} icon={plusIcon}>{t('Add Version')}</Button>
        </DialogTrigger>
        <DialogSurface>
            <form onSubmit={handleSubmit(handleRegistration, handleError)}>
                <DialogBody>
                    <DialogTitle className="user-select:none">{t('Add Version')}</DialogTitle>
                    <DialogContent>
                        {
                            !isDoing && !errorMsg &&
                            <div className="flex flex:col mb:16 mt:16>label mb:8>label">
                                <Label htmlFor="version">
                                    {t('Version')}
                                    <span className="color:red">*</span>
                                </Label>
                                <Input id="version" defaultValue={recommendedVersionNumber} {...register('version', { required: 'Version is required', validate: validateVersion })} appearance="filled-darker" placeholder={recommendedVersionNumber} />

                                <Label htmlFor="notes">
                                    {t('Release Notes')}
                                </Label>
                                <Textarea id="notes" {...register('notes')} resize="vertical" appearance="filled-darker" />

                                <Label htmlFor="main">
                                    {t('Main file')}
                                </Label>
                                <Combobox
                                    id="main"
                                    {...register('main')}
                                    defaultValue={recommendedMainFile}
                                    freeform
                                    appearance="filled-darker"
                                >
                                    {modFilenameList.map((option) => (
                                        <Option key={option} >
                                            {option}
                                        </Option>
                                    ))}
                                </Combobox>

                                <Label htmlFor="configFiles">
                                    {t('Config files')}
                                </Label>

                                <Combobox
                                    id="configFiles"
                                    defaultSelectedOptions={selectedConfigFiles}
                                    freeform
                                    onChange={(event) => console.log(event)}
                                    onOptionSelect={(_, data) => {
                                        setSelectedConfigFiles(data.selectedOptions)
                                    }}
                                    onOpenChange={(_, data) => setConfigFilesComboBoxOpen(data.open)}
                                    multiselect
                                    appearance="filled-darker"
                                >
                                    {
                                        selectedConfigFiles.filter(x => !modFilenameList.includes(x))
                                            .map(option =>
                                                <Option key={option}>
                                                    {option}
                                                </Option>
                                            )
                                    }
                                    {
                                        modFilenameList.map(option =>
                                            <Option key={option}>
                                                {option}
                                            </Option>
                                        )
                                    }
                                </Combobox>

                                <label htmlFor="configFiles" className={`${configFilesComboBoxOpen ? 'opacity:.2' : ''} z:9 mt:-30! h:30 flex py:4 mr:8>div pl:8 mr:30 flex-wrap:nowrap overflow:clip`}>
                                    {
                                        selectedConfigFiles.map((filename, i) => <Badge key={i}>{filename}</Badge>)
                                    }
                                </label>
                            </div>
                        }
                        {
                            isDoing &&
                            <div className="flex flex:col overflow:clip">
                                <Spinner />
                                <div className="center my:16">
                                    {t('Getting source repository')}
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