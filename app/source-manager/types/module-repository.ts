export type ModuleRepository ={
    type: 'github' | 'gitee'
    owner: string
    repo: string
    branch?: string
}