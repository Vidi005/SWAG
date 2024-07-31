import Swal from "sweetalert2"

const isStorageExist = content => {
  if (!navigator.cookieEnabled) {
    alert(content)
    return false
  } else {
    return true
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
      inlineData: { data: base64EncodedDataPromise, mimeType: file.type }
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

export { isStorageExist, fileToGenerativePart }