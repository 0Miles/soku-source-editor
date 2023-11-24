import githubIcon from '../../../icons/github.icon'
import linkIcon from '../../../icons/link.icon'

export default function VersionDownloadLink({downloadLink, className}) {
    return <div className={`${className} flex p:8 r:3 bg:#141414@dark bg:#f5f5f5@light align-items:center my:4`}>
        <div className="mr:8 inline-flex">
            {
                downloadLink.type === 'github' && githubIcon
            }
            {
                downloadLink.type === 'other' && linkIcon
            }
        </div>
        <div className="white-space:nowrap overflow:clip text-overflow:ellipsis">
            {downloadLink.url}
        </div>
    </div>
}