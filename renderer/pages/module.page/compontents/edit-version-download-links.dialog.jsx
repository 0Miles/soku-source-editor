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
    Input
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import linkIcon from '../../../icons/link.icon'
import trashIcon from '../../../icons/trash.icon'
import plusIcon from '../../../icons/plus.icon'

import * as api from '../../../common/api'
import VersionDownloadLink from './version-download-link'


export default function EditVersionDownloadLinksDialog({ sourceName, moduleName, versionInfo, onCompleted }) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [doingMessage, setDoingMessage] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const [downloadLinks, setDownloadLinks] = useState()
    const [customLink, setCustomLink] = useState('')
    const [validUrlMessage, setValidUrlMessage] = useState('')
    const [validUrl, setValidUrl] = useState(false)

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)
        setDownloadLinks([...versionInfo.downloadLinks ?? []])
        setCustomLink('')
        setValidUrl(false)
        setValidUrlMessage('')

        setOpen(true)
    }

    const removeDownloadLink = (index) => {
        downloadLinks.splice(index, 1)
        setDownloadLinks([...downloadLinks])
    }

    const addDownloadLink = () => {
        let type = 'other'

        if (customLink.match(/^https?:\/\/github\.com\//)) {
            type = 'github'
        }

        downloadLinks.push({
            type,
            url: customLink
        })
        setDownloadLinks([...downloadLinks])
        setCustomLink('')
    }

    const validationUrl = (value) => {
        let valid = !!value
        if (value && !value.match(/https?:\/\/.+/)) {
            setValidUrlMessage(t('Invalid URL'))
            valid = false
        } else if (downloadLinks.find(x => x.url === value)) {
            setValidUrlMessage(t('The same URL has been added'))
            valid = false
        } else {
            setValidUrlMessage('')
        }
        setValidUrl(valid)
    }

    const handleSubmitAction = async () => {
        setIsDoing(true)
        try {
            setDoingMessage(t('Updating version information file...'))
            await api.updateModVersion(sourceName, moduleName, versionInfo.version, {
                downloadLinks
            })

            setOpen(false)
            onCompleted && onCompleted({ downloadLinks: downloadLinks })
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
                    v{versionInfo.version} - {t('Download links')}
                </DialogTitle>
                <DialogContent>
                    {
                        !isDoing && !errorMsg &&
                        <>
                            <div className="my:16">
                                {
                                    downloadLinks?.map(
                                        (downloadLink, i) =>
                                            <div key={i} className="flex align-items:center">
                                                <VersionDownloadLink className="flex flex:1 w:0 mr:8" downloadLink={downloadLink} />
                                                <Button onClick={() => removeDownloadLink(i)} icon={trashIcon} appearance="subtle" />
                                            </div>
                                    )
                                }
                                {
                                    !downloadLinks?.length &&
                                    <div className="flex h:46 justify-content:center align-items:center">
                                        {t('No download link has been released yet')}
                                    </div>
                                }
                            </div>

                            <div className="mb:8 f:16">
                                {t('Add custom link')}
                            </div>
                            <div className="flex align-items:center">
                                <Input
                                    className="flex flex:1 mr:8"
                                    value={customLink}
                                    onChange={(_, data) => { setCustomLink(data.value); validationUrl(data.value) }}
                                    contentBefore={<div className="inline-flex f:white@dark f:#242424@light my:6 ml:-4 mr:6">{linkIcon}</div>}
                                    appearance="filled-darker"
                                    placeholder="https://example.com/mod.zip"
                                />
                                <Button icon={plusIcon} onClick={() => addDownloadLink()} appearance="subtle" disabled={!validUrl} />
                            </div>
                            <div className="mb:24">
                                {validUrlMessage}
                            </div>
                        </>

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
                            <Button onClick={() => handleSubmitAction()} appearance="primary">{t('Edit')}</Button>
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