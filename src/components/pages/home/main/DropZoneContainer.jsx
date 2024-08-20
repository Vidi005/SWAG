import React from "react"
import Dropzone from "react-dropzone"
import Swal from "sweetalert2"

const DropZoneContainer = ({ t, isLoading, isGenerating, genAIInput, pickCurrentImages, currentImgURLs, removeCurrentImage }) => {
  if (genAIInput === 'multimodal') {
    return (
      <Dropzone
        accept={{ 'image/*': [] }}
        maxFiles={10}
        multiple
        onDrop={acceptedFiles => {
          const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'))
          if (imageFiles.length > 0) pickCurrentImages(imageFiles)
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
        onDropRejected={() => {
          Swal.fire({
            icon: 'info',
            title: t('max_files_exceeded.0'),
            text: t('max_files_exceeded.1'),
            confirmButtonColor: 'blue',
            confirmButtonText: t('ok')
          })
        }}
        disabled={isLoading || isGenerating}
      >
        {({ getRootProps }) => (
          <React.Fragment>
            {currentImgURLs.length === 0
              ? (
                <div className="dropzone grow w-full border-2 border-dashed border-cyan-700 dark:border-gray-300 grid items-center justify-center p-2 rounded-lg duration-200" {...getRootProps()}>
                  <h3 className="font-normal text-lg text-center text-cyan-900 dark:text-gray-100">{t('drop_image')}</h3>
                </div>
              )
            : (
                <div className="image-preview-container flex-auto h-0 max-w-full flex flex-nowrap items-center gap-2 overflow-x-auto">
                  {currentImgURLs.map((currentImgURL, index) => (
                    <div key={index} className="image-preview-item relative h-full p-1 duration-200">
                      <img src={currentImgURL} alt="Image Preview" className="h-full object-contain rounded-md shadow-md dark:shadow-white/50 overflow-hidden" />
                      <span className="absolute grid items-center justify-center text-center font-mono bg-gray-500/75 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs text-white top-0 right-0 aspect-square px-1.5 cursor-pointer rounded-full" onClick={() => removeCurrentImage(index)}>X</span>
                    </div>
                  ))}
                  {currentImgURLs.length < 10 && (
                    <div className="dropzone hidden sm:grid grow h-full min-w-max border-2 border-dashed border-cyan-700 dark:border-gray-300 items-center justify-center p-2 rounded-lg duration-200" {...getRootProps()}>
                      <h3 className="font-normal text-lg text-center text-cyan-900 dark:text-gray-100">{t('drop_image')}</h3>
                    </div>
                  )}
                </div>
              )
            }
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