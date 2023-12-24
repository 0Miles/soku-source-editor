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
    Switch
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useRef, useState } from 'react'

import * as api from '../../../../common/api'
import RepoItem from '../repo-item'

export default function ReleaseVersionDialog({ hostType, sourceName, modInfo, versionInfo, onCompleted, disabled }) {
    const { t } = useTranslation()

    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [doingMessage, setDoingMessage] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const [title, setTitle] = useState('Release on Github')
    const [repositories, setRepositories] = useState([])
    const [selectedRepository, setSelectedRepository] = useState()
    const [updateRecommendedVersion, setUpdateRecommendedVersion] = useState(true)
    const [waitManualUpload, setWaitManualUpload] = useState(false)

    const okButtonResolve = useRef()

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)
        setWaitManualUpload(false)
        okButtonResolve.current = null

        switch (hostType) {
            case 'github':
                setTitle('Release on Github')
                break
            case 'gitee':
                setTitle('Release on Gitee')
                break
        }
        setRepositories(modInfo.repositories?.filter(x => x.type === hostType) ?? [])
        setSelectedRepository(modInfo.repositories?.find(x => x.type === hostType))
        setUpdateRecommendedVersion(true)

        setOpen(true)
    }

    const handleSubmitAction = async () => {
        setIsDoing(true)
        try {
            setDoingMessage(t(`Releasing...`))

            let downloadUrl
            switch (hostType) {
                case 'github':
                    downloadUrl = await api.githubRelease(sourceName, modInfo.name, versionInfo.version, selectedRepository)
                    break
                case 'gitee':
                    downloadUrl = await api.giteeRelease(sourceName, modInfo.name, versionInfo.version, selectedRepository)
                    break
            }

            setDoingMessage(t(`Adding download link...`))
            const newDownloadLink = { type: hostType, url: downloadUrl }

            if (hostType === 'gitee') {
                setDoingMessage(t('Gitee cannot upload files through the API. Please manually upload the output zip file to the opened Gitee release page and click OK.'))
                setWaitManualUpload(true)
                await new Promise(resolve => okButtonResolve.current = resolve)
            }

            await api.addModVersionDownloadLink(sourceName, modInfo.name, versionInfo.version, newDownloadLink)

            if (updateRecommendedVersion) {
                setDoingMessage(t(`Updating recommended version...`))
                await api.updateMod(sourceName, modInfo.name, {
                    recommendedVersionNumber: versionInfo.version
                })
            }
            
            setOpen(false)
            onCompleted && onCompleted(newDownloadLink)
        }
        catch (ex) {
            setErrorMsg(ex.message)
            setIsDoing(false)
        }
    }

    const closeAndCompleted = () => {
        okButtonResolve.current && okButtonResolve.current()
    }

    return <Dialog open={open}>
        <DialogTrigger>
            <Button onClick={openDialog} disabled={disabled}>{t('Release')}</Button>
        </DialogTrigger>
        <DialogSurface>
            <DialogBody>
                <DialogTitle className="user-select:none">
                    v{versionInfo.version} - {t(title)}
                </DialogTitle>
                <DialogContent>
                    {
                        !isDoing && !errorMsg &&
                        <div className="flex flex:col pr:8 mb:16 mt:16>label mb:8>label">
                            <label htmlFor="repositoriesDropdown">{t('Target repository')}</label>
                            <Dropdown
                                defaultValue={`${selectedRepository?.owner}/${selectedRepository?.repo}`}
                                onOptionSelect={(_, data) => setSelectedRepository(data.optionValue)}
                                id="repositoriesDropdown"
                            >
                                {repositories.map((repository, index) => (
                                    <Option as="div" key={index} value={repository} text={`${repository?.owner}/${repository?.repo}`}>
                                        <RepoItem className="w:full" repo={repository} />
                                    </Option>
                                ))}
                            </Dropdown>
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
                                {errorMsg}
                            </div>
                        </div>
                    }
                </DialogContent>

                <DialogActions className="user-select:none">
                    {
                        !isDoing && !errorMsg &&
                        <>
                            <Button onClick={handleSubmitAction} appearance="primary">{t('Release')}</Button>
                            <Button onClick={() => setOpen(false)} appearance="subtle">{t('Cancel')}</Button>
                        </>
                    }
                    {
                        waitManualUpload &&
                        <>
                            <Button onClick={closeAndCompleted} appearance="primary">{t('OK')}</Button>
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