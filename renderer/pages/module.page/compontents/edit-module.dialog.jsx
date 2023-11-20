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
    SpinButton
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import * as api from '../../../common/api'

import pencilIcon from '../../../icons/pencil.icon'
import gearIcon from '../../../icons/gear.icon'
import ImagePicker from '../../../common/image-picker'

export default function EditModuleDialog({ className, sourceName, modInfo, onCompleted, TriggerButton }) {
    const { t } = useTranslation()
    const { register, handleSubmit, reset, formState } = useForm({
        mode: 'all'
    })
    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const [iconUrl, setIconUrl] = useState(false)
    const [bannerUrl, setBannerUrl] = useState(false)

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)
        reset()
        setIconUrl(modInfo.icon)
        setBannerUrl(modInfo.banner)


        setOpen(true)
    }

    const handleRegistration = async (data) => {
        setIsDoing(true)
        try {
            data.icon = iconUrl
            data.banner = bannerUrl
            await api.updateMod(sourceName, modInfo.name, data)
            setOpen(false)
            onCompleted && onCompleted()
        }
        catch (ex) {
            setErrorMsg(ex.message)
            setIsDoing(false)
        }
    }
    const handleError = (errors) => console.error(errors)

    return <Dialog open={open}>
        <Button className={className} onClick={openDialog} icon={pencilIcon}></Button>

        <DialogSurface>
            <form onSubmit={handleSubmit(handleRegistration, handleError)}>
                <DialogBody>
                    <DialogTitle className="user-select:none">{t('Edit Module')} - {modInfo.name}</DialogTitle>
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
                                            <ImagePicker id="icon" className="abs block w:full h:full" defaultValue={iconUrl} onChange={(value) => setIconUrl(value)} />
                                            <div className="abs pointer-events:none z:-1">
                                                {gearIcon}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex:1">
                                        <Label htmlFor="banner">
                                            {t('Banner')}
                                        </Label>
                                        <ImagePicker id="banner" className="block bg:gray/.2 h:120 overflow:clip mt:8" defaultValue={bannerUrl} onChange={(value) => setBannerUrl(value)} />
                                    </div>
                                </div>

                                <Label htmlFor="description">
                                    {t('Description')}
                                </Label>
                                <Input id="description" defaultValue={modInfo.description} {...register('description')} appearance="filled-darker" />

                                <Label htmlFor="author">
                                    {t('Author')}
                                </Label>
                                <Input id="author" defaultValue={modInfo.author} {...register('author')} appearance="filled-darker" />

                                <Label htmlFor="priority">
                                    {t('Module Priority')}
                                </Label>
                                <SpinButton id="priority" defaultValue={modInfo.priority} min={-100} max={100} {...register('priority')} appearance="filled-darker" />


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