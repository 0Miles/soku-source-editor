import { nanoid } from 'nanoid'
import { useState } from 'react'

export default function ImagePicker({ defaultValue, className, id, onChange }) {
    const [fileUrl, setFileUrl] = useState(defaultValue)

    const fileInputOnChangeHandle = (event) => {
        const imageUrl = 'file:///' + event.target.files[0].path
        setFileUrl(imageUrl)
        onChange && onChange(imageUrl)
    }

    return <>
        <label className={`${className} cursor:pointer`} htmlFor={id}>
            {
                fileUrl &&
                <img className="object-fit:cover w:full h:full" src={fileUrl + '?' + nanoid()} />
            }
        </label>
        <input className="hide" type="file" id={id} accept=", image/webp, image/png, image/jpeg, image/gif" onChange={fileInputOnChangeHandle} />
    </>
}