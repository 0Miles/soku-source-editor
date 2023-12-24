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

import * as api from '../../../../common/api'
import I18nPropertyTextarea from '../../../../common/i18n-property-textarea'

export default function EditVersionNotesDialog({ sourceName, moduleName, versionInfo, onCompleted }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [doingMessage, setDoingMessage] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const [notesValues, setNotesValues] = useState({ default: '' })

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)
        const notesValues = { default: versionInfo.notes ?? '' }
        versionInfo.notesI18n?.forEach(x => notesValues[x.language] = x.content)
        setNotesValues(notesValues)

        setOpen(true)
    }

    const handleSubmitAction = async () => {
        setIsDoing(true)
        try {
            setDoingMessage(t('Updating version information file...'))
            const data = {}
            data.notes = notesValues.default ?? ''
            data.notesI18n = Object.entries(notesValues).filter(([lang, content]) => lang !== 'default').map(([lang, content]) => ({ language: lang, content }))
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
            <DialogBody>
                <DialogTitle className="user-select:none">
                    v{versionInfo.version} - {t('Release notes')}
                </DialogTitle>
                <DialogContent>
                    {
                        !isDoing && !errorMsg &&
                        <div className="flex flex:col pr:8 mb:16 mt:16>label mb:8>label">
                            <I18nPropertyTextarea label={t('Release notes')} propertyName="notes" defaultLang="default" defaultValues={notesValues} onChange={setNotesValues} />
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
                            <Button onClick={handleSubmitAction} appearance="primary">{t('Edit')}</Button>
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
        </DialogSurface>
    </Dialog>
}