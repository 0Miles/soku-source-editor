import { useMemo } from 'react'
import TreeView, { flattenTree } from 'react-accessible-treeview'
import { VscFile, VscFolder, VscFolderOpened } from 'react-icons/vsc'
import './directory-tree-view.css'

export default function DirectoryTreeView({ folder, className }) {
    const data = useMemo(() => flattenTree(folder), [folder])
    return (
        <div className={className}>
            <div className="directory">
                <TreeView
                    data={data}
                    aria-label="directory tree"
                    nodeRenderer={({
                        element,
                        isBranch,
                        isExpanded,
                        getNodeProps,
                        level,
                    }) => (
                        <div {...getNodeProps()} style={{ paddingLeft: 20 * (level - 1) }}>
                            {isBranch ? (
                                <FolderIcon isOpen={isExpanded} />
                            ) : (
                                <FileIcon filename={element.name} />
                            )}

                            {element.name}
                        </div>
                    )}
                />
            </div>
        </div>
    )
}

const FolderIcon = ({ isOpen }) =>
    isOpen ? (
        <VscFolderOpened color="e8a87c" className="icon" />
    ) : (
        <VscFolder color="e8a87c" className="icon" />
    )

const FileIcon = ({ filename }) => {
    const extension = filename.slice(filename.lastIndexOf('.') + 1)
    switch (extension) {
        default:
            return <VscFile className="icon" />
    }
}