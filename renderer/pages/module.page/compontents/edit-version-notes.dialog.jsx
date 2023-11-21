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
    Textarea
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as api from '../../../common/api'

export default function EditVersionNotesDialog({ sourceName, moduleName, versionInfo, onCompleted }) {
    const { t } = useTranslation()
    const { register, handleSubmit, reset, formState } = useForm({
        mode: 'all'
    })
    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [doingMessage, setDoingMessage] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)

        reset()
        setOpen(true)
    }

    const handleAddVersion = async (data) => {
        setIsDoing(true)
        try {
            setDoingMessage(t('Updating version information file...'))
            await api.updateModVersion(sourceName, moduleName, versionInfo.version, data)

            setOpen(false)
            onCompleted && onCompleted(data)
        }
        catch (ex) {
            setErrorMsg(ex.message)
            setIsDoing(false)
        }
    }

    return <Dialog open={open}>
        <DialogTrigger>
            <Button onClick={openDialog}>{t('Edit')}</Button>
        </DialogTrigger>
        <DialogSurface>
            <form onSubmit={handleSubmit(handleAddVersion)}>
                <DialogBody>
                    <DialogTitle className="user-select:none">
                        v{versionInfo.version} - {t('Release Notes')}
                    </DialogTitle>
                    <DialogContent>
                        {
                            !isDoing && !errorMsg &&
                            <div className="flex flex:col pr:8 mb:16 mt:16>label mb:8>label">
                                <Textarea id="notes" className="h:260>textarea" defaultValue={versionInfo.notes} {...register('notes')} resize="vertical" appearance="filled-darker" />
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