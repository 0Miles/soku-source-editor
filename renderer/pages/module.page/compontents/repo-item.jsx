import giteeIcon from '../../../icons/gitee.icon'
import githubIcon from '../../../icons/github.icon'

export default function RepoItem({repo, className}) {
    return <div className={`${className} p:8 r:3 bg:#141414@dark bg:#f5f5f5@light`}>
        <div className="mr:8 inline-flex">
            {
                repo.type === 'github' && githubIcon
            }
            {
                repo.type === 'gitee' && giteeIcon
            }
        </div>
        <div className="white-space:nowrap overflow:clip text-overflow:ellipsis">
            {repo.owner}/{repo.repo}
        </div>
    </div>
}