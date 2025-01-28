import React, { useState, useEffect } from 'react'
import { ProgressBar, Button } from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'

export default function UpdateStatus() {
    const { t } = useTranslation()

    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState('')
    const [isDownloading, setIsDownloading] = useState(false)
    const [updateReady, setUpdateReady] = useState(false)
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)

    const handleDownloadUpdate = () => {
        setStatus(t('Starting to download updates...'))
        setIsDownloading(true)
        if (window.ipcApi) {
            window.ipcApi.sendToMain('start-download')
        }
    }

    const handleInstallUpdate = () => {
        if (window.ipcApi) {
            window.ipcApi.sendToMain('install-update')
        }
    }

    useEffect(() => {
        if (window.ipcApi) {
            window.ipcApi.on('update-available', () => {
                setIsUpdateAvailable(true)
                setStatus(t('A new version has been detected. Do you want to download the update?'))
            })

            window.ipcApi.on('download-progress', (progressObj) => {
                setProgress(progressObj.percent / 100)
                setStatus(t('Downloading updates...'))
            })

            window.ipcApi.on('update-downloaded', () => {
                setIsDownloading(false)
                setUpdateReady(true)
                setStatus(t('Updates have been downloaded. Do you want to install them?'))
            })
        }
    }, [t])

    return (
        <div className="flex flex:col gap:8 p:4">
            <div className="f:14 color:gray-70">
                {status}
            </div>

            {isDownloading && <ProgressBar value={progress} max={1} />}

            {!isDownloading && !updateReady && isUpdateAvailable && (
                <Button appearance="primary" onClick={handleDownloadUpdate}>
                    {t('Download updates')}
                </Button>
            )}

            {updateReady && (
                <Button appearance="primary" onClick={handleInstallUpdate}>
                    {t('Install updates')}
                </Button>
            )}
        </div>
    )
}
