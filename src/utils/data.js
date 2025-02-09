import Swal from "sweetalert2"

const isStorageExist = content => {
  if (!navigator.cookieEnabled) {
    alert(content)
    return false
  } else {
    return true
  }
}

const geminiAIModels = [
  {
    variant: 'gemini-2.0-flash',
    input: 'multimodal',
    isSupportSystemInstructions: true
  },
  {
    variant: 'gemini-1.5-pro',
    input: 'multimodal',
    isSupportSystemInstructions: true
  },
  {
    variant: 'gemini-1.5-flash',
    input: 'multimodal',
    isSupportSystemInstructions: true
  },
  {
    variant: 'gemini-1.5-flash-8b',
    input: 'multimodal',
    isSupportSystemInstructions: true
  },
  {
    variant: 'gemini-1.0-pro',
    input: 'text',
    isSupportSystemInstructions: false
  }
]

const getUserPrompt = () => {
  const queryStr = location.search
  const urlParams = new URLSearchParams(queryStr)
  const idParam = urlParams.get('id')
  if (isNaN(Number(idParam))) {
    return null
  } else {
    return Number(idParam)
  }
}

const fileToGenerativePart = async (file) => {
  try {
    const base64EncodedDataPromise = new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result.split(',')[1])
      reader.readAsDataURL(file)
      reader.onerror = error => reject(error)
    })
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type }
    }
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message.toString(),
      confirmButtonColor: 'blue'
    })
    throw error
  }
}

export { isStorageExist, geminiAIModels, getUserPrompt, fileToGenerativePart }