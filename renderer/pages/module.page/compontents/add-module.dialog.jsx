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

import plusIcon from '../../../icons/plus.icon'

export default function AddModDialog({ sourceName, sourceMods, onCompleted }) {
    const { t } = useTranslation()
    const { register, handleSubmit, reset, formState } = useForm({
        mode: 'all'
    })
    const [open, setOpen] = useState(false)
    const [isDoing, setIsDoing] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const openDialog = () => {
        setErrorMsg('')
        setIsDoing(false)
        reset()

        setOpen(true)
    }

    const handleRegistration = async (data) => {
        setIsDoing(true)
        try {
            await api.addMod(sourceName, data.name, JSON.stringify(data))
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

    return <Dialog open={open}>
        <DialogTrigger>
            <Button onClick={openDialog} className="w:full min-h:70 cursor:auto!" appearance="subtle">
                {plusIcon}
            </Button>
        </DialogTrigger>
        <DialogSurface>
            <form onSubmit={handleSubmit(handleRegistration, handleError)}>
                <DialogBody>
                    <DialogTitle className="user-select:none">{t('Add Module')}</DialogTitle>
                    <DialogContent>
                        {
                            !isDoing && !errorMsg &&
                            <div className="flex flex:col mb:16 mt:16>label mb:8>label">
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
                                <Label htmlFor="description">
                                    {t('Description')}
                                </Label>
                                <Input id="description" {...register('description')} appearance="filled-darker" />

                                <Label htmlFor="author">
                                    {t('Author')}
                                </Label>
                                <Input id="author" {...register('author')} appearance="filled-darker" />

                                <Label htmlFor="priority">
                                    {t('Module Priority')}
                                </Label>
                                <SpinButton id="priority" defaultValue={0} min={-100} max={100} {...register('priority')} appearance="filled-darker" />


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