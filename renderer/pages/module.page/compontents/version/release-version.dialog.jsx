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
    Dropdown,
    Option,
    Switch,
    Checkbox
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'

import * as api from '../../../../common/api'
import RepoItem from '../repo-item'

export default function ReleaseVersionDialog({ sourceName, modInfo, versionInfo, onCompleted, onCancel, disabled, openFunc, noButton }) {
    const { t } = useTranslation()

    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [doingMessage, setDoingMessage] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const [repositories, setRepositories] = useState([])
    const [selectedRepositories, setSelectedRepositories] = useState([])
    const [updateRecommendedVersion, setUpdateRecommendedVersion] = useState(true)
    const [waitManualUpload, setWaitManualUpload] = useState(false)

    const onClose = useRef()
    const okButtonResolve = useRef()
    const okButtonReject = useRef()

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)
        setWaitManualUpload(false)
        okButtonResolve.current = null
        okButtonReject.current = null
        onClose.current = null

        setRepositories(modInfo.repositories ?? [])
        setSelectedRepositories(modInfo.repositories ?? [])
        setUpdateRecommendedVersion(true)

        setOpen(true)
    }

    const handleSubmitAction = async () => {
        setIsDoing(true)
        const errorMessages = []
        const newDownloadLinks = []

        setDoingMessage(`${t(`Export package...`)}`)
        await api.exportZipToOutput(sourceName, modInfo.name, versionInfo.version)

        for (const repository of selectedRepositories) {
            try {
                setDoingMessage(`${repository.owner}/${repository.repo} ${t(`Releasing...`)}`)

                let downloadUrl
                switch (repository.type) {
                    case 'github':
                        downloadUrl = await api.githubRelease(sourceName, modInfo.name, versionInfo.version, repository)
                        break
                    case 'gitee':
                        downloadUrl = await api.giteeRelease(sourceName, modInfo.name, versionInfo.version, repository)
                        break
                }

                if (!downloadUrl) {
                    throw new Error('Upload asset failed.')
                }

                setDoingMessage(`${repository.owner}/${repository.repo} ${t(`Adding download link...`)}`)
                const newDownloadLink = { type: repository.type, url: downloadUrl }

                if (repository.type === 'gitee') {
                    setDoingMessage(t('Gitee cannot upload files through the API. Please manually upload the output zip file to the opened Gitee release page and click OK.'))
                    setWaitManualUpload(true)
                    await new Promise((resolve, reject) => {
                        okButtonResolve.current = resolve
                        okButtonReject.current = reject
                    })
                    setWaitManualUpload(false)
                }

                await api.addModVersionDownloadLink(sourceName, modInfo.name, versionInfo.version, newDownloadLink)
                newDownloadLinks.push(newDownloadLink)
            }
            catch (ex) {
                errorMessages.push(`${repository.owner}/${repository.repo}: ${ex.message}`)
            }
        }

        setIsDoing(false)

        if (newDownloadLinks.length > 0) {
            if (updateRecommendedVersion) {
                setDoingMessage(t(`Updating recommended version...`))
                await api.updateMod(sourceName, modInfo.name, {
                    recommendedVersionNumber: versionInfo.version
                })
            }
            onCompleted && onCompleted(newDownloadLinks)
        }

        if (errorMessages.length > 0) {
            setErrorMsg(errorMessages.join('\n'))
        } else {
            setOpen(false)
        }
    }

    const repositoryCheckboxChangeHandle = (checked, repository) => {
        if (checked) {
            setSelectedRepositories([...selectedRepositories, repository])
        } else {
            setSelectedRepositories(selectedRepositories.filter(x => x !== repository))
        }
    }

    const cancel = () => {
        setOpen(false)
        onCancel && onCancel()
    }

    openFunc && openFunc(openDialog)

    return <>
        {
            !!versionInfo &&
            <Dialog open={open}>
                {
                    !noButton &&
                    <DialogTrigger>
                        <Button onClick={openDialog} disabled={disabled}>{t('Release')}</Button>
                    </DialogTrigger>
                }
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle className="user-select:none">
                            v{versionInfo.version} - {t('Release on repository')}
                        </DialogTitle>
                        <DialogContent>
                            {
                                !isDoing && !errorMsg &&
                                <div className="flex flex:col pr:8 mb:16">
                                    <div className="mb:8 mt:16">{t('Target repository')}</div>
                                    <div className="max-h:500 overflow-y:auto">
                                        {repositories.map((repository, index) => (
                                            <div key={index} className="flex align-items:center my:4">
                                                <Checkbox id={`repository-${index}`} className="mr:8" defaultChecked={selectedRepositories.includes(repository)} onChange={(_, data) => repositoryCheckboxChangeHandle(data.checked, repository)} />
                                                <label htmlFor={`repository-${index}`} className="flex:1">
                                                    <RepoItem className="w:full r:3 bg:#141414@dark bg:#f5f5f5@light p:8" repo={repository} />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt:16 flex align-items:center justify-content:end user-select:none">
                                        <Switch id="updateRecommendedVersion" checked={updateRecommendedVersion} onChange={(_, data) => setUpdateRecommendedVersion(data.checked)} />
                                        <label htmlFor="updateRecommendedVersion">{t('Set this version as the recommended version after releasing')}</label>
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
                                        {
                                            errorMsg.split('\n').map((line, index) => <p key={index}>{line}</p>)
                                        }
                                    </div>
                                </div>
                            }
                        </DialogContent>

                        <DialogActions className="user-select:none">
                            {
                                !isDoing && !errorMsg &&
                                <>
                                    <Button disabled={!selectedRepositories?.length} onClick={handleSubmitAction} appearance="primary">{t('Release')}</Button>
                                    <Button onClick={() => cancel()} appearance="subtle">{t('Cancel')}</Button>
                                </>
                            }
                            {
                                waitManualUpload && !errorMsg &&
                                <>
                                    <Button onClick={() => okButtonResolve.current && okButtonResolve.current()} appearance="primary">{t('OK')}</Button>
                                    <Button onClick={() => okButtonReject.current && okButtonReject.current('Cancelled')} appearance="subtle">{t('Cancel')}</Button>
                                </>
                            }
                            {
                                errorMsg &&
                                <>
                                    <Button onClick={() => cancel()} appearance="primary">{t('OK')}</Button>
                                </>
                            }
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        }
    </>
}