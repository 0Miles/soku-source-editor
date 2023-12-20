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
    Label
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

import plusIcon from '../../../icons/plus.icon'
import { useShared } from '../../../contexts/shared'
import repoUrlRegex from '../../../utils/repo-url.regex'

export default function AddSourceDialog() {
    const { t } = useTranslation()
    const { sources, refreshSources, addSource } = useShared()
    const [sourceUrl, setSourceUrl] = useState('')
    const [open, setOpen] = useState(false)
    const [isCloning, setIsCloning] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [customName, setCustomName] = useState('')
    const [recommendedName, setRecommendedName] = useState('')
    const [validRepoUrl, setValidRepoUrl] = useState(false)

    const addSourceButtonHandle = async () => {
        setIsCloning(true)
        try {
            await addSource(sourceUrl, customName ? customName : recommendedName)
            await refreshSources()
            setOpen(false)
        }
        catch (ex) {
            setErrorMsg(ex.message)
            setIsCloning(false)
        }
    }

    const openDialog = () => {
        setRecommendedName('')
        setCustomName('')
        setErrorMsg('')
        setSourceUrl('')
        setIsCloning(false)
        setValidRepoUrl(false)
        setOpen(true)
    }

    const getRecommendedName = (value) => {
        if (sources.find(x => x.name === value)) {
            const match = value.match(/^(.*?)(\d+)?$/)
            const name = match[1]
            const num = Number(match[2] ?? 0) + 1
            return getRecommendedName(name + num)
        } else {
            return value
        }
    }

    const validationRepoUrl = (value) => {
        const match = value.match(repoUrlRegex)
        if (match) {
            setRecommendedName(getRecommendedName(match[3]))
        }
        setValidRepoUrl(!!match)
    }

    return <Dialog open={open}>
        <DialogTrigger>
            <Button onClick={openDialog} className="w:full min-h:70 cursor:auto!" appearance="subtle">
                {plusIcon}
            </Button>
        </DialogTrigger>
        <DialogSurface>
            <DialogBody>
                <DialogTitle className="user-select:none">{t('Add Source')}</DialogTitle>
                <DialogContent>
                    {
                        !isCloning && !errorMsg &&
                        <div className="flex flex:col mb:16 mt:16>label mb:8>label">
                            <Label htmlFor="repoUrl">
                                {t('Repository URL')}
                                <span className="color:red">*</span>
                            </Label>
                            <Input id="repoUrl" onChange={(_, data) => { setSourceUrl(data.value); validationRepoUrl(data.value) }} appearance="filled-darker" placeholder="https://github.com/{owner}/{repo}.git" />

                            <Label htmlFor="customName">
                                {t('Name')}
                            </Label>
                            <Input id="customName" onChange={(_, data) => { setCustomName(data.value) }} appearance="filled-darker" placeholder={recommendedName} />
                        </div>
                    }
                    {
                        isCloning &&
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
                        !isCloning && !errorMsg &&
                        <>
                            <Button onClick={addSourceButtonHandle} appearance="primary" disabled={!validRepoUrl}>{t('Add')}</Button>
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