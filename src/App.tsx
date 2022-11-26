import { useState } from 'react'
import ak from './assets/ak.jpg'

function App() {
  const [url, setUrl] = useState(ak)

  const changeUrl = async () => {
    // @ts-ignore
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'Images',
          accept: {
            'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
          },
        },
      ],
    })
    const fileData = await fileHandle.getFile();
    const reader = new FileReader()
    reader.readAsDataURL(fileData)
    reader.onload = () => {
      setUrl(reader.result as string)
    }
  }

  return (
    <div className="App">
      <button onClick={changeUrl}>选择图片</button>
      <br />
      {/* @ts-ignore */}
      <active-img-draw url={ url } width='800' />
    </div>
  )
}

export default App
