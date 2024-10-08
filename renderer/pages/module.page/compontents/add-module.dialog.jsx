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
    Textarea
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useState, useMemo } from 'react'
import { set, useForm } from 'react-hook-form'

import plusIcon from '../../../icons/plus.icon'
import gearIcon from '../../../icons/gear.icon'
import linkIcon from '../../../icons/link.icon'

import ImagePicker from '../../../common/image-picker'
import repoUrlRegex from '../../../utils/repo-url.regex'
import githubIcon from '../../../icons/github.icon'
import giteeIcon from '../../../icons/gitee.icon'
import RepoItem from './repo-item'
import trashIcon from '../../../icons/trash.icon'
import MultipleItemInput from '../../../common/multiple-item.input'
import I18nPropertyTextarea from '../../../common/i18n-property-textarea'

export default function AddModuleDialog({ sourceName, sourceMods, onCompleted }) {
    const { t } = useTranslation()
    const { register, handleSubmit, reset, formState } = useForm({
        mode: 'all'
    })
    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const [iconUrl, setIconUrl] = useState(false)
    const [bannerUrl, setBannerUrl] = useState(false)
    const [repositories, setRepositories] = useState([])
    const [descriptionValues, setDescriptionValues] = useState({ default: '' })

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)
        setIconUrl()
        setBannerUrl()
        setRepositories([])
        setDescriptionValues({ default: '' })
        reset()

        setOpen(true)
    }

    const handleSubmitAction = async (data) => {
        setIsDoing(true)
        try {
            data.icon = iconUrl
            data.banner = bannerUrl
            data.repositories = repositories
            data.description = descriptionValues.default ?? ''
            data.descriptionI18n = Object.entries(descriptionValues).filter(([lang, content]) => lang !== 'default').map(([lang, content]) => ({ language: lang, content }))
            await window.ipcApi.addMod(sourceName, data.name, data)
            setOpen(false)
            onCompleted && onCompleted()
        }
        catch (ex) {
            setErrorMsg(ex.message)
            setIsDoing(false)
        }
    }
    const handleError = (errors) => console.error(errors)

    const validateModuleName = (value) => {
        return !sourceMods?.find(x => x.name === value)
    }

    const repositoryInputOnChange = (repoUrls) => {
        setRepositories(repoUrls.map(repoUrl => {
            const match = repoUrl.match(repoUrlRegex)
            return {
                type: match[1],
                owner: match[2],
                repo: match[3]
            }
        }))
    }

    return <Dialog open={open}>

        <DialogTrigger>
            <Button onClick={openDialog} icon={plusIcon}>{t('Add Module')}</Button>
        </DialogTrigger>
        <DialogSurface>
            <form onSubmit={handleSubmit(handleSubmitAction, handleError)}>
                <DialogBody>
                    <DialogTitle className="user-select:none">{t('Add Module')}</DialogTitle>
                    <DialogContent>
                        {
                            !isDoing && !errorMsg &&
                            <div className="flex flex:col pr:8 mb:16 mt:16>label mb:8>label">
                                <div className="flex mt:16">
                                    <div className="mr:16">
                                        <Label htmlFor="icon">
                                            {t('Icon')}
                                        </Label>
                                        <div className="rel flex justify-content:center align-items:center bg:gray/.2 aspect-ratio:1/1 w:120 overflow:clip mt:8">
                                            <ImagePicker id="icon" className="abs block w:full h:full" onChange={(value) => setIconUrl(value)} />
                                            <div className="abs pointer-events:none z:-1">
                                                {gearIcon}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex:1">
                                        <Label htmlFor="banner">
                                            {t('Banner')}
                                        </Label>
                                        <ImagePicker id="banner" className="block bg:gray/.2 h:120 overflow:clip mt:8" onChange={(value) => setBannerUrl(value)} />
                                    </div>
                                </div>
                                <Label htmlFor="name">
                                    {t('Name')}
                                    <span className="color:red">*</span>
                                </Label>
                                <Input id="name" {...register('name', { required: 'Name is required', validate: validateModuleName })} appearance="filled-darker" />
                                {
                                    !!formState.errors.name && formState.errors.name.type !== 'required' &&
                                    <div className="color:gray-80">
                                        {t('Module already exists')}
                                    </div>
                                }

                                <I18nPropertyTextarea label={t('Description')} propertyName={'description'} defaultLang={'default'} defaultValues={descriptionValues} onChange={(values) => setDescriptionValues(values)} />
                                
                                <Label htmlFor="author">
                                    {t('Author')}
                                </Label>
                                <Input id="author" {...register('author')} appearance="filled-darker" />

                                <Label htmlFor="priority">
                                    {t('Module priority')}
                                </Label>
                                <SpinButton id="priority" defaultValue={0} min={-100} max={100} {...register('priority')} appearance="filled-darker" />

                                <Label>
                                    {t('Repository')}
                                </Label>
                                <MultipleItemInput
                                    placeholder={'https://github.com/{owner}/{repo}'}
                                    itemTemplate={
                                        (repoUrl) => {
                                            const match = repoUrl.match(repoUrlRegex)
                                            const repo = {
                                                type: match[1],
                                                owner: match[2],
                                                repo: match[3]
                                            }
                                            return <RepoItem className="flex:1 w:0 p:8 mr:8 align-items:center r:3 bg:#141414@dark bg:#f5f5f5@light" repo={repo} />
                                        }
                                    }
                                    matchRegex={repoUrlRegex}
                                    onChange={repositoryInputOnChange} />

                            </div>
                        }
                        {
                            isDoing &&
                            <div className="flex flex:col overflow:clip">
                                <Spinner />
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