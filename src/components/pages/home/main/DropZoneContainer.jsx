import React from "react"
import Dropzone from "react-dropzone"
import Swal from "sweetalert2"

const DropZoneContainer = ({ t, isLoading, isGenerating, genAIInput, pickImage, imgFile, removeImage }) => {
  if (genAIInput === 'multimodal') {
    return (
      <Dropzone
        accept={{ 'image/*': [] }}
        onDrop={acceptedFiles => {
          const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'))
          if (imageFiles.length > 0) pickImage(imageFiles)
          else {
            Swal.fire({
              icon: 'error',
              title: t('invalid_file.0'),
              text: t('invalid_file.1'),
              confirmButtonColor: 'blue',
              confirmButtonText: t('ok')
            })
          }
        }}
        disabled={isLoading || isGenerating}
      >
        {({ getRootProps }) => (
          <React.Fragment>
            {imgFile === null
              ? (
                <div className="dropzone grow w-full border-2 border-dashed border-cyan-700 dark:border-gray-300 grid items-center justify-center p-2 rounded-lg duration-200" {...getRootProps()}>
                  <h3 className="font-normal text-lg text-center text-cyan-900 dark:text-gray-100">{t('drop_image')}</h3>
                </div>
              )
              : (
                <div className="image-preview relative flex-auto h-0 w-fit max-w-full p-1 duration-200">
                  <img src={URL.createObjectURL(imgFile)} alt="Image Preview" className="h-full max-w-full object-contain rounded-md shadow-md dark:shadow-white/50 overflow-hidden" />
                  <span className="absolute grid items-center justify-center text-center font-mono bg-gray-500/75 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-white top-0 right-0 aspect-square px-1.5 cursor-pointer rounded-full" onClick={removeImage}>X</span>
                </div>
              )}
          </React.Fragment>
        )}
      </Dropzone>
    )
  } else {
    return (
      <div className="input-mode-info grow w-full bg-orange-200 dark:bg-orange-800 grid items-center justify-center p-2 rounded-lg duration-200">
        <h5 className="font-normal text-xs md:text-sm text-center text-orange-900 dark:text-orange-50">
          <span>{t('input_mode_info')}</span>
          <a className="text-blue-700 dark:text-blue-300 hover:text-orange-900 dark:hover:text-orange-50 active:text-violet-700 duration-200" href="https://ai.google.dev/gemini-api/docs/models/gemini" target="_blank" rel="noopener noreferrer"> <u>{t('learn_more')}</u></a>
        </h5>
      </div>
    )
  }
}

export default DropZoneContainer