import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import PageContainer from './page-container'

export default function MultiLevelPageContainer({ children, className, level = 1 }) {
    const location = useLocation()
    const [layersCount, setLayersCount] = useState(level ?? 1)
    useEffect(() => {
        const paths = location?.pathname?.replace(/^\/|\/$/g, '').split('/')
        if (paths.length !== layersCount) {
            setLayersCount(paths.length)
        }
    }, [location, layersCount])

    return (
        <div className={`${className ?? ''} flex flex:auto h:0 w:200% ~translate|.2s|cubic-bezier(0.66,0,0.86,0) ${layersCount > level ? '{translate:-50%}' : ''}`}>
            <PageContainer className={`w:50% @transition-up|.3s|cubic-bezier(0.14,1,0.34,1) ~opacity|.3s ${layersCount > level ? 'opacity:0' : ''}`}>
                {children}
            </PageContainer>

            <div className="w:50% flex flex:col">
                <Outlet />
            </div>
        </div>
    )
}