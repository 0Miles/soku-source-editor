import { createContext, useState, useRef, useContext } from 'react'
import {
    Button,
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent
} from '@fluentui/react-components'
import { useTranslation } from 'react-i18next'


export const MessageBoxButtons = {
    OK: 0,
    OKCancel: 1,
    AbortRetryIgnore: 2,
    YesNoCancel: 3,
    YesNo: 4,
    RetryCancel: 5,
    CancelTryContinue: 6
}

export const MessageBoxIcon = {
    None: 0,
    Hand: 16,
    Error: 16,
    Stop: 16,
    Question: 32,
    Exclamation: 48,
    Warning: 48,
    Asterisk: 64,
    Information: 64
}

export const DialogResult = {
    None: 0,
    OK: 1,
    Cancel: 2,
    Abort: 3,
    Retry: 4,
    Ignore: 5,
    Yes: 6,
    No: 7,
    Continue: 11,
}


const MessageBoxContext = createContext()

export const MessageBoxProvider = ({ children }) => {
    const { t } = useTranslation()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [messageBoxButtons, setMessageBoxButtons] = useState(0)
    const [messageBoxIcon, setMessageBoxIcon] = useState()

    const dialogPromiseRef = useRef()

    const showMessageBox = async (title, content, messageBoxButtons, messageBoxIcon) => {
        setTitle(title)
        setContent(content)
        setMessageBoxButtons(messageBoxButtons ?? 0)
        switch (messageBoxIcon) {
            case MessageBoxIcon.Question:
                setMessageBoxIcon(
                    <svg className="mr:16" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                        <path d="M12 16v.01"></path>
                        <path d="M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"></path>
                    </svg>
                )
                break
            case MessageBoxIcon.Asterisk:
            case MessageBoxIcon.Information:
                setMessageBoxIcon(
                    <svg className="mr:16" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                        <path d="M12 9h.01"></path>
                        <path d="M11 12h1v4h1"></path>
                    </svg>
                )
                break
            case MessageBoxIcon.Exclamation:
            case MessageBoxIcon.Warning:
                setMessageBoxIcon(
                    <svg className="mr:16" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 9v4"></path>
                        <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z"></path>
                        <path d="M12 16h.01"></path>
                    </svg>
                )
                break
            case MessageBoxIcon.Error:
            case MessageBoxIcon.Hand:
            case MessageBoxIcon.Stop:
                setMessageBoxIcon(
                    <svg className="mr:16" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                        <path d="M10 10l4 4m0 -4l-4 4"></path>
                    </svg>
                )
                break
            default:
                setMessageBoxIcon()
                break
        }
        setIsDialogOpen(true)
        return new Promise((resolve, reject) => {
            dialogPromiseRef.current = { resolve, reject }
        })
    }

    const closeDialog = (result) => {
        setIsDialogOpen(false)
        dialogPromiseRef.current.resolve(result)
    }

    return (
        <MessageBoxContext.Provider value={{ showMessageBox }}>
            {children}

            <Dialog modalType="alert" inertTrapFocus="true" open={isDialogOpen}>
                <DialogSurface>
                    <div className="flex">
                        {messageBoxIcon}

                        <DialogBody className="flex:1">
                            <DialogTitle className="user-select:none">{title}</DialogTitle>
                            <DialogContent>
                                {content}
                            </DialogContent>
                            <DialogActions className="user-select:none">
                                {
                                    (messageBoxButtons === MessageBoxButtons.OK ||
                                        messageBoxButtons === MessageBoxButtons.OKCancel) &&
                                    <Button onClick={() => closeDialog(DialogResult.OK)} appearance="primary">{t('OK')}</Button>
                                }
                                {
                                    (messageBoxButtons === MessageBoxButtons.Yes ||
                                        messageBoxButtons === MessageBoxButtons.YesNo ||
                                        messageBoxButtons === MessageBoxButtons.YesNoCancel) &&
                                    <Button onClick={() => closeDialog(DialogResult.Yes)} appearance="primary">{t('Yes')}</Button>
                                }
                                {
                                    (messageBoxButtons === MessageBoxButtons.RetryCancel) &&
                                    <Button onClick={() => closeDialog(DialogResult.Retry)} appearance="primary">{t('Retry')}</Button>
                                }
                                {
                                    (messageBoxButtons === MessageBoxButtons.AbortRetryIgnore) &&
                                    <Button onClick={() => closeDialog(DialogResult.Abort)} appearance="primary">{t('Abort')}</Button>
                                }
                                {
                                    (messageBoxButtons === MessageBoxButtons.CancelTryContinue) &&
                                    <Button onClick={() => closeDialog(DialogResult.Continue)} appearance="primary">{t('Continue')}</Button>
                                }
                                {
                                    (messageBoxButtons === MessageBoxButtons.CancelTryContinue) &&
                                    <Button onClick={() => closeDialog(DialogResult.Cancel)} appearance="primary">{t('Cancel')}</Button>
                                }

                                {
                                    (messageBoxButtons === MessageBoxButtons.YesNo ||
                                        messageBoxButtons === MessageBoxButtons.YesNoCancel) &&
                                    <Button onClick={() => closeDialog(DialogResult.No)} appearance="subtle">{t('No')}</Button>
                                }
                                {
                                    (messageBoxButtons === MessageBoxButtons.AbortRetryIgnore ||
                                        messageBoxButtons === MessageBoxButtons.CancelTryContinue) &&
                                    <Button onClick={() => closeDialog(DialogResult.Retry)} appearance="subtle">{t('Retry')}</Button>
                                }
                                {
                                    (messageBoxButtons === MessageBoxButtons.AbortRetryIgnore) &&
                                    <Button onClick={() => closeDialog(DialogResult.Ignore)} appearance="subtle">{t('Ignore')}</Button>
                                }
                                {
                                    (messageBoxButtons === MessageBoxButtons.OKCancel ||
                                        messageBoxButtons === MessageBoxButtons.YesNoCancel ||
                                        messageBoxButtons === MessageBoxButtons.RetryCancel) &&
                                    <Button onClick={() => closeDialog(DialogResult.Cancel)} appearance="subtle">{t('Cancel')}</Button>
                                }
                            </DialogActions>
                        </DialogBody>
                    </div>
                </DialogSurface>
            </Dialog>
        </MessageBoxContext.Provider>
    );
};

export const useMessageBox = () => {
    return useContext(MessageBoxContext);
};