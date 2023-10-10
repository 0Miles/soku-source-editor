import { useEffect, useState } from 'react'
import {
    Button,
    Menu,
    MenuTrigger,
    MenuList,
    MenuItem,
    MenuPopover
} from '@fluentui/react-components'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import chevronRightIcon from '../icons/chevron-right.icon'
import dotsIcon from '../icons/dots.icon'

const firstLetterCap = (value) => {
    if (!value) return ''
    if (value.length === 1) return value.toUpperCase()
    return value.charAt(0).toUpperCase() + value.substring(1)
}

export default function Breadcrumbs() {
    const navigate = useNavigate()
    const location = useLocation()
    const [abbrPaths, setAbbrPaths] = useState([])
    const [prevPath, setPrevPath] = useState(null)
    const [currentPath, setCurrentPath] = useState('')
    const { t } = useTranslation()

    const chevronRightElement = <div className="f:32 color:#cccccc@dark color:#5c5c5c@light mx:8 mt:4">
        {chevronRightIcon}
    </div>

    useEffect(() => {
        const originPaths = location?.pathname?.split('/')
        originPaths.shift()

        let tmpParentPath = '/'
        const paths = []

        for (let i = 0; i < originPaths.length; i++) {
            if (!originPaths[i]) continue

            let link = tmpParentPath + originPaths[i] + '/'
            let title
            switch (link) {
                case '/module/info/':
                case '/module/edit/':
                    i++
                    link += originPaths[i] + '/'
                    title = firstLetterCap(originPaths[i])
                    break
                default:
                    title = t(firstLetterCap(originPaths[i]))
                    break
            }

            paths.push({
                title,
                parent: tmpParentPath,
                link
            })
            tmpParentPath = link
        }

        if (paths.length) {
            setCurrentPath(paths.pop().title)
            setPrevPath(paths.pop())
            setAbbrPaths(paths)
        }

    }, [location, t])

    return <div className="flex overflow:hidden align-items:center user-select:none>*">
        {
            !!abbrPaths.length && <div className="flex align-items:center">
                <Menu hasIcons={false}>
                    <MenuTrigger disableButtonEnhancement>
                        <Button as="div" className="color:inherit!:hover opacity:.85 opacity:1:hover opacity:.65:active" size="large" appearance="transparent" icon={dotsIcon} />
                    </MenuTrigger>

                    <MenuPopover>
                        <MenuList>
                            {
                                abbrPaths.map((path, index) => (
                                    <>
                                        <MenuItem key={'path-menu-item-' + index} onClick={() => { navigate(path.link) }}>{path.title}</MenuItem>
                                    </>
                                ))
                            }
                        </MenuList>
                    </MenuPopover>
                </Menu>
                {chevronRightElement}
            </div>
        }
        {
            prevPath && <>
                <div onClick={() => { navigate(prevPath.link) }} className="opacity:.85 opacity:1:hover opacity:.65:active line-height:normal f:32 white-space:nowrap overflow:hidden text-overflow:ellipsis">
                    {prevPath.title}
                </div>
                {chevronRightElement}
            </>
        }

        <div className="white-space:nowrap overflow:hidden text-overflow:ellipsis line-height:normal f:32">{currentPath}</div>
    </div>
}