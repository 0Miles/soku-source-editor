import { useState } from 'react'

export default function Dropzone({ className, children, onDrop, onClick }) {
    const [isDragActive, setIsDragActive] = useState(false)

    return <>
        <div
            className={className}
            onClick={onClick}
            onDragOver={(event) => { event.preventDefault() }}
            onDrop={
                async (event) => {
                    event.preventDefault()
                    setIsDragActive(false)
                    const fileHandlesPromises = [...event.dataTransfer.items]
                        .filter(item => item.kind === 'file')
                        .map(item => item.getAsFile())

                    const files = (await Promise.allSettled(fileHandlesPromises)).map(x => x.value)
                    onDrop && onDrop(files)
                }
            }
            onDragEnter={(event) => { event.preventDefault(); setIsDragActive(true) }}
            onDragLeave={(event) => { event.preventDefault(); setIsDragActive(false) }} >
            {children({ isDragActive })}
        </div>
    </>
}