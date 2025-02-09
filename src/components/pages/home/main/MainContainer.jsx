import React from "react"
import UserDataEntry from "../pop_up/UserDataEntry"
import PromptContainer from "./PromptContainer"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import PreviewContainer from "./PreviewContainer"
import Swal from "sweetalert2"
import HtmlCodeContainer from "./HtmlCodeContainer"
import CssCodeContainer from "./CssCodeContainer"
import JsCodeContainer from "./JsCodeContainer"
import { fileToGenerativePart, geminiAIModels, getUserPrompt, isStorageExist } from "../../../../utils/data"
import DownloadFileModal from "../pop_up/DownloadFileModal"
import JSZip from "jszip"
import { createIframeWorker } from "../../../../utils/worker"

class MainContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      GEMINI_AI_TEMPERATURE_STORAGE_KEY: 'GEMINI_AI_TEMPERATURE_STORAGE_KEY',
      GEMINI_AI_MODEL_STORAGE_KEY: 'GEMINI_AI_MODEL_STORAGE_KEY',
      CHUNKED_PROMPTS_STORAGE_KEY: 'CHUNKED_PROMPTS_STORAGE_KEY',
      USER_PROMPTS_STORAGE_KEY: 'USER_PROMPTS_STORAGE_KEY',
      USER_RESULTS_STORAGE_KEY: 'USER_RESULTS_STORAGE_KEY',
      TEMP_WEB_PREVIEW_STORAGE_KEY: 'TEMP_WEB_PREVIEW_STORAGE_KEY',
      savedApiKey: localStorage.getItem('USER_API_STORAGE_KEY'),
      temperature: 10,
      geminiAIModels: geminiAIModels,
      selectedModel: geminiAIModels[0],
      isLoading: false,
      isEditing: false,
      isGenerating: false,
      isSidebarOpened: false,
      currentPrompt: '',
      lastPrompt: '',
      promptId: 0,
      chunkedPromptsData: [],
      getSortedChunkedPrompts: [],
      sortBy: this.props.t('sort_chunked_prompts.0'),
      currentImgFiles: [],
      currentImgURLs: [],
      lastImgFiles: [],
      abortController: null,
      responseResult: '',
      areCodesCopied: false,
      areTextsWrapped: false,
      isHTMLCodeCopied: false,
      isCSSCodeCopied: false,
      isJSCodeCopied: false,
      isDialogOpened: false,
      userChatData: null
    }
    this.inputRef = React.createRef()
    this.fileInputRef = React.createRef()
    this.tempSettingInfoRef = React.createRef()
    this.tempSettingContentInfoRef = React.createRef()
    this.iframeRef = React.createRef()
  }

  componentDidMount() {
    this.loadSavedGeminiTemp()
    this.loadSavedGeminiModel()
    this.loadChunkedPrompts().then(() => {
      if (location.toString().includes('/prompt') && location.toString().includes('?id=')) this.loadPromptAndResult()
      setTimeout(() => {
        this.setState({
          sortBy: this.props.t('sort_chunked_prompts.0'),
          getSortedChunkedPrompts: this.state.chunkedPromptsData
        })
      }, 10)
    })
    if (this.state.currentPrompt.length > 0 || this.state.currentImgFiles.length > 0 || this.state.isEditing) {
      addEventListener('beforeunload', () => {
        this.onUnloadPage.bind(this)
        localStorage.removeItem(this.state.TEMP_WEB_PREVIEW_STORAGE_KEY)
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.responseResult !== this.state.responseResult) this.showHTMLIframe()
    if (prevState.currentImgFiles.length !== this.state.currentImgFiles.length && this.state.currentImgFiles.length > 0) {
      this.setState(({ currentImgURLs: [...this.state.currentImgFiles.map(file => URL.createObjectURL(file))]
      }))
    }
    if (prevProps.t('sort_chunked_prompts.0') !== this.props.t('sort_chunked_prompts.0')) {
      this.setState({ sortBy: this.props.t('sort_chunked_prompts.0') })
    }
    if (!this.state.isLoading || !this.state.isGenerating) removeEventListener('beforeunload', this.onUnloadPage)
    if (this.state.isLoading || this.state.isGenerating || this.state.currentPrompt.length > 0 || this.state.currentImgFiles.length > 0 || this.state.isEditing) {
      addEventListener('beforeunload', this.onUnloadPage)
    }
  }

  componentWillUnmount() {
    removeEventListener('beforeunload', () => {
      this.onUnloadPage.bind(this)
      if (this.state.isLoading || this.state.isGenerating) {
        if (this.state.responseResult !== '') this.saveUserResultData()
        this.stopPrompt()
      }
      localStorage.removeItem(this.state.TEMP_WEB_PREVIEW_STORAGE_KEY)
    })
  }

  onUnloadPage (event) {
    event.preventDefault()
    event.returnValue = this.props.t('unsaved_warning')
  }

  loadSavedGeminiTemp() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      const geminiAITemperature = localStorage.getItem(this.state.GEMINI_AI_TEMPERATURE_STORAGE_KEY) || this.state.temperature
      this.setState({ temperature: geminiAITemperature })
    }
  }

  loadSavedGeminiModel() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      const geminiAIModel = localStorage.getItem(this.state.GEMINI_AI_MODEL_STORAGE_KEY) || this.state.selectedModel.variant
      this.setState({ selectedModel: geminiAIModels.find(model => model.variant === geminiAIModel) })
    }
  }

  searchHandler(event) {
    const searchQuery = event.target.value.toLowerCase()
    const { sortBy } = this.state
    const chunkedPromptList = this.state.chunkedPromptsData
    if (searchQuery.length === 0) this.sortHandler(sortBy)
    else {
      let searchData = chunkedPromptList
      if (sortBy !== this.props.t('sort_chunked_prompts.0')) {
        searchData = chunkedPromptList.filter(chunkedPrompt => chunkedPrompt.promptChunk === sortBy)
      }
      searchData = searchData.filter(chunkedPrompt => chunkedPrompt.promptChunk.toLowerCase().includes(searchQuery))
      this.setState({ getSortedChunkedPrompts: searchData })
    }
    scrollTo(0, 0)
  }

  sortHandler(sortBy) {
    const chunkedPromptList = this.state.chunkedPromptsData.map(chunkedPrompt => ({ ...chunkedPrompt }))
    if (sortBy === this.props.t('sort_chunked_prompts.0')) {
      this.setState({ getSortedChunkedPrompts: chunkedPromptList })
    } else {
      const sortedChunkedPrompts = chunkedPromptList.sort((a, b) => b.id - a.id)
      this.setState({ getSortedChunkedPrompts: sortedChunkedPrompts })
    }
    this.setState({ sortBy: sortBy })
  }

  async loadChunkedPrompts() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      const chunkedPrompts = localStorage.getItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
      try {
        const parsedChunkedPrompts = await JSON.parse(chunkedPrompts)
        if (parsedChunkedPrompts !== null) {
          this.setState({
            chunkedPromptsData: parsedChunkedPrompts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
            getSortedChunkedPrompts: parsedChunkedPrompts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          })
        }
      } catch (error) {
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        alert(`${this.props.t('error_alert')}: ${error.message}\n${this.props.t('error_solution')}.`)
      }
    }
  }

  loadPromptAndResult() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved) && location.toString().includes('?id=')) {
      let userPrompts = localStorage.getItem(this.state.USER_PROMPTS_STORAGE_KEY)
      let userResults = localStorage.getItem(this.state.USER_RESULTS_STORAGE_KEY)
      try {
        let parsedUserPrompts = JSON.parse(userPrompts)
        let parsedUserResults = JSON.parse(userResults)
        if (parsedUserPrompts !== null && parsedUserPrompts[0].id !== undefined) {
          const foundPrompt = parsedUserPrompts.find(prompt => prompt.id === getUserPrompt())
          if (foundPrompt) {
            this.setState({ promptId: foundPrompt?.id, lastPrompt: foundPrompt?.prompt }, () => {
              userPrompts = null
              parsedUserPrompts = null
            })
          } else {
            userPrompts = null
            parsedUserPrompts = null
            Swal.fire({
              icon: 'error',
              title: this.props.t('prompt_not_found.0'),
              text: this.props.t('prompt_not_found.1'),
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            }).then(() => history.pushState('', '', location.origin))
          }
        }
        if (parsedUserResults !== null && parsedUserResults[0].id !== undefined) {
          const foundResult = parsedUserResults.find(result => result.id === getUserPrompt())
          if (foundResult) {
            this.setState({ responseResult: foundResult?.result }, () => {
              userResults = null
              parsedUserResults = null
            })
          } else {
            userResults = null
            parsedUserResults = null
            Swal.fire({
              icon: 'error',
              title: this.props.t('result_not_found.0'),
              text: this.props.t('result_not_found.1'),
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            }).then(() => this.setState({ responseResult: '' }))
          }
        }
      } catch (error) {
        userPrompts = null
        userResults = null
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        alert(`${this.props.t('error_alert')}: ${error.message}\n${this.props.t('error_solution')}.`)
        history.pushState('', '', location.origin)
      }
    }
  }

  loadAllPrompts() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      let userPrompts = localStorage.getItem(this.state.USER_PROMPTS_STORAGE_KEY)
      try {
        const parsedUserPrompts = JSON.parse(userPrompts)
        if (parsedUserPrompts !== null && parsedUserPrompts[0].id !== undefined) {
          return parsedUserPrompts
        } else {
          return []
        }
      } catch (error) {
        userPrompts = null
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        alert(`${this.props.t('error_alert')}: ${error.message}\n${this.props.t('error_solution')}.`)
        return null
      }
    }
  }

  loadAllResults() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      let userResults = localStorage.getItem(this.state.USER_RESULTS_STORAGE_KEY)
      try {
        const parsedUserResults = JSON.parse(userResults)
        if (parsedUserResults !== null && parsedUserResults[0].id !== undefined) {
          return parsedUserResults
        } else {
          return []
        }
      } catch (error) {
        userResults = null
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        alert(`${this.props.t('error_alert')}: ${error.message}\n${this.props.t('error_solution')}.`)
        return null
      }
    }
  }

  handleTempChange(event) {
    if (!this.state.isGenerating || !this.state.isLoading) {
      this.setState({ temperature: event.target.value }, () => {
        if (isStorageExist(this.props.t('browser_warning'))) localStorage.setItem(this.state.GEMINI_AI_TEMPERATURE_STORAGE_KEY, event.target.value)
      })
    }
  }

  showTempSettingInfo (event, isHovered) {
    setTimeout(() => {
      const tempSettingInfo = this.tempSettingInfoRef.current.getBoundingClientRect()
      const tempSettingContentInfo = this.tempSettingContentInfoRef.current
      const tooltipWidth = tempSettingContentInfo?.offsetWidth
      const tooltipHeight = tempSettingContentInfo?.offsetHeight
      const leftPosition = event.clientX
      const containerHalfWidth = document.documentElement.clientWidth / 2
      if (tempSettingContentInfo) {
        if (isHovered) {
          tempSettingContentInfo.style.display = 'block'
          tempSettingContentInfo.style.right = 'auto'
          if (leftPosition < containerHalfWidth) {
            tempSettingContentInfo.style.left = `${tempSettingInfo.right + 4}px`
            tempSettingContentInfo.style.top = `${tempSettingInfo.top - tooltipHeight}px`
          } else {
            tempSettingContentInfo.style.left = `${tooltipWidth + 8}px`
            tempSettingContentInfo.style.top = `${tempSettingInfo.top - 16}px`
          }
        } else tempSettingContentInfo.style.display = 'none'
      }
    }, 1)
  }

  changeGeminiModel(selectedVariant) {
    if (!this.state.isGenerating || !this.state.isLoading) {
      this.setState({ selectedModel: this.state.geminiAIModels.find(model => model.variant === selectedVariant) }, () => {
        if (isStorageExist(this.props.t('browser_warning'))) {
          localStorage.setItem(this.state.GEMINI_AI_MODEL_STORAGE_KEY, this.state.selectedModel.variant)
        }
        if (this.state.selectedModel.variant !== 'multimodal') this.setState({ currentImgFiles: [], currentImgURLs: [], lastImgFiles: [] })
      })
    }
  }

  handleCurrentPromptChange(event) {
    if (!this.state.isGenerating || !this.state.isLoading) {
      this.setState({ currentPrompt: event.target.value })
    }
  }

  handleLastPromptChange(event) {
    if (!this.state.isGenerating || !this.state.isLoading) {
      this.setState({ lastPrompt: event.target.value })
    }
  }

  pickCurrentImages(imgFiles) {
    if (imgFiles.length === 0) return
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
    const maxFileSize = 10 * 1024 * 1024
    const validFiles = Array.from(imgFiles).filter(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      if (file.size > maxFileSize) {
        Swal.fire({
          icon: 'error',
          title: this.props.t('file_size_limit.0'),
          text: this.props.t('file_size_limit.1'),
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
        return
      }
      if (!validImageExtensions.includes(fileExtension)) {
        Swal.fire({
          icon: 'error',
          title: this.props.t('invalid_file.0'),
          text: this.props.t('invalid_file.1'),
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
        return
      }
      return true
    })
    if (validFiles.length > 0) {
      this.setState(prevState => {
        const currentImgFiles = [...prevState.currentImgFiles, ...validFiles]
        if (currentImgFiles.length > 10) {
          Swal.fire({
            icon: 'info',
            title: this.props.t('max_files_exceeded.0'),
            text: this.props.t('max_files_exceeded.1'),
            confirmButtonColor: 'blue',
            confirmButtonText: this.props.t('ok')
          })
          return
        }
        else return ({ currentImgFiles: currentImgFiles })
      })
    }
  }

  async takeScreenshot() {
    try {
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })
      const videoElement = document.createElement('video')
      videoElement.srcObject = captureStream
      videoElement.autoplay = true
      await new Promise(resolve => {
        videoElement.onloadedmetadata = () => {
          videoElement.width = videoElement.videoWidth
          videoElement.height = videoElement.videoHeight
          resolve()
        }
      })
      const canvas = document.createElement('canvas')
      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => {
        if (blob) {
          let imageFile = new File([blob], `Screenshot-${+new Date()}.png`, { type: 'image/png' })
          this.setState(prevState => {
            const currentImgFiles = [...prevState.currentImgFiles, imageFile]
            if (currentImgFiles.length > 10) {
              Swal.fire({
                icon: 'error',
                title: this.props.t('max_files_exceeded.0'),
                text: this.props.t('max_files_exceeded.1'),
                confirmButtonColor: 'blue',
                confirmButtonText: this.props.t('ok')
              })
              return
            }
            else return ({ currentImgFiles: currentImgFiles })
          }, () => imageFile = null)
        }
      }, 'image/png')
      captureStream.getVideoTracks().forEach(track => track.stop())
    } catch (error) {
      Swal.fire({
        title: this.props.t('capture_error'),
        text: error.message,
        icon: 'error',
        confirmButtonColor: 'blue'
      })
    }
  }

  pickLastImages(imgFiles) {
    if (imgFiles.length === 0) return
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']
    const maxFileSize = 10 * 1024 * 1024
    const validFiles = Array.from(imgFiles).filter(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      if (file.size > maxFileSize) {
        Swal.fire({
          icon: 'error',
          title: this.props.t('file_size_limit.0'),
          text: this.props.t('file_size_limit.1'),
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
        return
      }
      if (!validImageExtensions.includes(fileExtension)) {
        Swal.fire({
          icon: 'error',
          title: this.props.t('invalid_file.0'),
          text: this.props.t('invalid_file.1'),
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
        return
      }
      return true
    })
    if (validFiles.length > 0) {
      this.setState(prevState => {
        const lastImgFiles = [...prevState.lastImgFiles, ...validFiles]
        if (lastImgFiles.length > 10) {
          Swal.fire({
            icon: 'info',
            title: this.props.t('max_files_exceeded.0'),
            text: this.props.t('max_files_exceeded.1'),
            confirmButtonColor: 'blue',
            confirmButtonText: this.props.t('ok')
          })
          return
        }
        else return ({ lastImgFiles: lastImgFiles })
      })
    }
  }

  removeCurrentImage(index) {
    this.setState(prevState => {
      const currentImgFiles = prevState.currentImgFiles.filter((_, i) => i !== index)
      const currentImgURLs = prevState.currentImgURLs.filter((_, i) => i !== index)
      return { currentImgFiles: currentImgFiles, currentImgURLs: currentImgURLs }
    })
  }
  
  removeLastImages() {
    this.setState({ lastImgFiles: [] }, () => {
      if (this.fileInputRef.current) this.fileInputRef.current.value = ''
    })
  }
  
  async postPrompt(model, userPrompt, inputImages) {
    let inputPrompt = ''
    if (this.state.selectedModel.isSupportSystemInstructions) inputPrompt = userPrompt
    else inputPrompt = `${this.props.t('system_instructions')} ${userPrompt}`
    try {
      const { totalTokens } = await model.countTokens(inputPrompt)
      if (totalTokens > 8192) {
        this.setState({
          responseResult: this.props.t('prompt_token_limit'),
          isLoading: false
        })
      } else {
        this.setState({ lastPrompt: userPrompt, lastImgFiles: inputImages }, () => this.saveUserPromptData())
        const abortController = new AbortController()
        this.setState({ abortController: abortController })
        if (inputImages?.length > 0) {
          const imageParts = await Promise.all([...inputImages?.map(inputImg => fileToGenerativePart(inputImg))])
          const result = await model.generateContentStream([inputPrompt, ...imageParts], { signal: abortController.signal })
          let text = ''
          for await (const chunk of result.stream) {
            if (abortController.signal.aborted) break
            const chunkText = chunk.text()
            text += chunkText
            this.setState({
              currentPrompt: '',
              currentImgFiles: [],
              currentImgURLs: [],
              responseResult: text,
              isLoading: false,
              isGenerating: true
            })
          }
        } else {
          const result = await model.generateContentStream(inputPrompt, { signal: abortController.signal })
          let text = ''
          for await (const chunk of result.stream) {
            if (abortController.signal.aborted) break
            const chunkText = chunk.text()
            text += chunkText
            this.setState({
              currentPrompt: '',
              currentImgFiles: [],
              currentImgURLs: [],
              responseResult: text,
              isLoading: false,
              isGenerating: true
            })
          }
        }
        this.setState({ isGenerating: false }, () => this.saveUserResultData())
      }      
    } catch (error) {
      if (error.name !== 'AbortError') {
        Swal.fire({
          icon: 'error',
          title: this.props.t('send_prompt_fail'),
          text: `${error.message}`,
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        }).then(() => {
          if (this.state.responseResult !== '') this.saveUserResultData()
        }).finally(() => this.setState({ isLoading: false, isGenerating: false }))
      }
    }
  }

  generatePrompt() {
    history.pushState('', '', location.origin)
    try {
      this.setState({
        isLoading: true,
        lastPrompt: '',
        responseResult: '',
        isEditing: false,
        areCodesCopied: false,
        isHTMLCodeCopied: false,
        isCSSCodeCopied: false,
        isJSCodeCopied: false
      })
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        }
      ]
      const genAI = new GoogleGenerativeAI(this.props.state.geminiApiKey)
      if (this.state.selectedModel.isSupportSystemInstructions) {
        const model = genAI.getGenerativeModel({
          model: this.state.selectedModel?.variant,
          systemInstruction: this.props.t('system_instructions'),
          safetySettings,
          generationConfig: { temperature: (this.state.temperature * 0.1).toFixed(1) }
        })
        this.postPrompt(model, this.state.currentPrompt, this.state.currentImgFiles)
      } else {
        const model = genAI.getGenerativeModel({
          model: this.state.selectedModel?.variant,
          safetySettings,
          generationConfig: { temperature: (this.state.temperature * 0.1).toFixed(1) }
        })
        this.postPrompt(model, this.state.currentPrompt, this.state.currentImgFiles)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: this.props.t('generate_prompt_fail'),
        text: error.message,
        confirmButtonColor: 'blue',
        confirmButtonText: this.props.t('ok')
      })
      this.setState({ isLoading: false })
    }
  }

  regeneratePrompt() {
    try {
      this.setState({
        promptId: getUserPrompt(),
        isLoading: true,
        responseResult: '',
        isEditing: false,
        areCodesCopied: false,
        isHTMLCodeCopied: false,
        isCSSCodeCopied: false,
        isJSCodeCopied: false
      })
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        }
      ]
      const genAI = new GoogleGenerativeAI(this.props.state.geminiApiKey)
      if (this.state.selectedModel.isSupportSystemInstructions) {
        const model = genAI.getGenerativeModel({
          model: this.state.selectedModel?.variant,
          systemInstruction: this.props.t('system_instructions'),
          safetySettings,
          generationConfig: { temperature: (this.state.temperature * 0.1).toFixed(1) }
        })
        this.postPrompt(model, this.state.lastPrompt, this.state.lastImgFiles)
      } else {
        const model = genAI.getGenerativeModel({
          model: this.state.selectedModel?.variant,
          safetySettings,
          generationConfig: { temperature: (this.state.temperature * 0.1).toFixed(1) }
        })
        this.postPrompt(model, this.state.lastPrompt, this.state.lastImgFiles)
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: this.props.t('generate_prompt_fail'),
        text: error.message,
        confirmButtonColor: 'blue',
        confirmButtonText: this.props.t('ok')
      })
      this.setState({ isLoading: false })
    }
  }

  stopPrompt() {
    if (this.state.abortController) {
      this.state.abortController.abort()
      this.setState({ isLoading: false, abortController: null, isGenerating: false })
    }
  }

  showHTMLIframe() {
    const worker = createIframeWorker()
    const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
    worker.postMessage({ htmlString: normalizedResponseResult })
    worker.onmessage = workerEvent => {
      if (this.iframeRef.current) this.iframeRef.current.srcdoc = workerEvent.data
      this.scrollToBottom()
      worker.terminate()
    }
  }

  scrollToBottom() {
    if (this.state.responseResult.includes('<html')) {
      this.iframeRef.current.contentWindow.scrollTo(0, 999999)
      const codeContent = document.querySelector('.html-code-content pre')
      if (codeContent) codeContent.scrollTop = codeContent.scrollHeight
    }
    if (this.state.responseResult.includes('<style>')) {
      const codeContent = document.querySelector('.css-code-content pre')
      if (codeContent) codeContent.scrollTop = codeContent.scrollHeight
    }
    if (this.state.responseResult.includes('<script>')) {
      const codeContent = document.querySelector('.js-code-content pre')
      if (codeContent) codeContent.scrollTop = codeContent.scrollHeight
    }
  }

  saveUserPromptData() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      const chunkedPromptsData = this.state.chunkedPromptsData.map(chunkedPrompt => ({ ...chunkedPrompt }))
      let chunkedPrompt = this.state.lastPrompt
      if (this.state.lastPrompt.length > 50) chunkedPrompt = `${this.state.lastPrompt.slice(0, 50)}...`
      const foundChunkedPrompt = chunkedPromptsData.find(chunkedPrompt => chunkedPrompt.id === getUserPrompt())
      if (foundChunkedPrompt) {
        chunkedPromptsData[chunkedPromptsData.indexOf(foundChunkedPrompt)] = {
          id: foundChunkedPrompt.id,
          promptChunk: chunkedPrompt,
          updatedAt: new Date().toISOString()
        }
        chunkedPromptsData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        localStorage.setItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY, JSON.stringify(chunkedPromptsData))
        if (this.loadAllPrompts() !== null) {
          const userPromptsData = this.loadAllPrompts().map(userPrompt => ({ ...userPrompt }))
          const foundUserPrompt = userPromptsData.find(userPrompt => userPrompt.id === getUserPrompt())
          if (foundUserPrompt) {
            userPromptsData[userPromptsData.indexOf(foundUserPrompt)] = {
              id: foundUserPrompt.id,
              prompt: this.state.lastPrompt
            }
          } else userPromptsData.push({ id: this.state.promptId, prompt: this.state.lastPrompt })
          localStorage.setItem(this.state.USER_PROMPTS_STORAGE_KEY, JSON.stringify(userPromptsData))
        } else {
          Swal.fire({
            icon: 'error',
            title: this.props.t('add_prompt_fail.0'),
            text: this.props.t('add_prompt_fail.1'),
            confirmButtonColor: 'blue',
            confirmButtonText: this.props.t('ok')
          })
        }
      } else {
        this.setState({ promptId: +new Date() }, () => {
          chunkedPromptsData.push({
            id: this.state.promptId,
            promptChunk: chunkedPrompt,
            updatedAt: (new Date()).toISOString()
          })
          chunkedPromptsData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          localStorage.setItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY, JSON.stringify(chunkedPromptsData))
          if (this.loadAllPrompts() !== null) {
            const userPromptsData = this.loadAllPrompts().map(userPrompt => ({ ...userPrompt }))
            const foundUserPrompt = userPromptsData.find(userPrompt => userPrompt.id === getUserPrompt())
            if (foundUserPrompt) {
              userPromptsData[userPromptsData.indexOf(foundUserPrompt)] = {
                id: foundUserPrompt.id,
                prompt: this.state.lastPrompt
              }
            } else userPromptsData.push({ id: this.state.promptId, prompt: this.state.lastPrompt })
            localStorage.setItem(this.state.USER_PROMPTS_STORAGE_KEY, JSON.stringify(userPromptsData))
          } else {
            Swal.fire({
              icon: 'error',
              title: this.props.t('add_prompt_fail.0'),
              text: this.props.t('add_prompt_fail.1'),
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            })
          }
        })
      }
    }
  }

  saveUserResultData() {
    if (isStorageExist(this.props.t('browser_warning')) && (this.state.savedApiKey || this.props.state.isDataWillBeSaved)) {
      if (this.loadAllResults() !== null) {
        const userResultsData = this.loadAllResults().map(userResult => ({ ...userResult }))
        const foundUserResult = userResultsData.find(userResult => userResult.id === getUserPrompt())
        if (foundUserResult) {
          userResultsData[userResultsData.indexOf(foundUserResult)] = {
            id: foundUserResult.id,
            result: this.state.responseResult
          }
        } else {
          userResultsData.push({ id: this.state.promptId, result: this.state.responseResult })
        }
        localStorage.setItem(this.state.USER_RESULTS_STORAGE_KEY, JSON.stringify(userResultsData))
        this.loadChunkedPrompts().then(() => this.loadPromptAndResult()).finally(() => window.history.pushState('', '', `prompt?id=${this.state.promptId}`))
      } else {
        Swal.fire({
          icon: 'error',
          title: this.props.t('add_result_fail.0'),
          text: this.props.t('add_result_fail.1'),
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
      }
    }
  }

  onEditHandler() {
    this.setState({ isEditing: true })
  }

  onCancelHandler() {
    this.setState({ isEditing: false })
  }

  toggleSidebar() {
    this.setState({ isSidebarOpened: !this.state.isSidebarOpened }, () => {
      if (this.state.isSidebarOpened) this.sortHandler(this.state.sortBy)
    })
  }

  closeSidebar() {
    this.setState({ isSidebarOpened: false, getSortedChunkedPrompts: this.state.chunkedPromptsData }, () => {
      if (this.state.promptId !== getUserPrompt()) {
        this.removeLastImages()
        if (this.state.isLoading || this.state.isGenerating) {
          if (this.state.responseResult !== '') this.saveUserResultData()
          this.stopPrompt()
        }
        this.setState({
          isEditing: false,
          currentPrompt: '',
          currentImgFiles: [],
          currentImgURLs: []
        }, () => this.loadPromptAndResult())
      }
    })
  }

  deleteAllPrompts() {
    Swal.fire({
      icon: 'warning',
      title: this.props.t('clear_all_histories.0'),
      text: this.props.t('clear_all_histories.1'),
      confirmButtonColor: 'blue',
      cancelButtonColor: "red",
      confirmButtonText: this.props.t('ok'),
      cancelButtonText: this.props.t('cancel'),
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_PROMPTS_STORAGE_KEY)
        localStorage.removeItem(this.state.USER_RESULTS_STORAGE_KEY)
        this.setState({
          lastPrompt: '',
          promptId: 0,
          chunkedPromptsData: [],
          getSortedChunkedPrompts: [],
          responseResult: ''
        }, () => this.closeSidebar())
      }
    })
  }

  deleteSelectedPrompt(promptId) {
    Swal.fire({
      icon: 'warning',
      title: this.props.t('clear_history.0'),
      text: this.props.t('clear_history.1'),
      confirmButtonColor: 'blue',
      cancelButtonColor: "red",
      confirmButtonText: this.props.t('ok'),
      cancelButtonText: this.props.t('cancel'),
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        const userPromptsData = this.loadAllPrompts().filter(userPrompt => userPrompt.id !== promptId)
        const userResultsData = this.loadAllResults().filter(userResult => userResult.id !== promptId)
        if (getUserPrompt() === promptId) {
          this.setState({
            lastPrompt: '',
            promptId: 0,
            chunkedPromptsData: this.state.chunkedPromptsData.filter(chunkedPrompt => chunkedPrompt.id !== promptId),
            getSortedChunkedPrompts: this.state.chunkedPromptsData.filter(chunkedPrompt => chunkedPrompt.id !== promptId),
            responseResult: ''
          }, () => {
            localStorage.setItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY, JSON.stringify(this.state.chunkedPromptsData))
            localStorage.setItem(this.state.USER_PROMPTS_STORAGE_KEY, JSON.stringify(userPromptsData))
            localStorage.setItem(this.state.USER_RESULTS_STORAGE_KEY, JSON.stringify(userResultsData))
            history.pushState('', '', location.origin)
            })
        } else {
          this.setState({
            chunkedPromptsData: this.state.chunkedPromptsData.filter(chunkedPrompt => chunkedPrompt.id !== promptId),
            getSortedChunkedPrompts: this.state.chunkedPromptsData.filter(chunkedPrompt => chunkedPrompt.id !== promptId)
          }, () => {
            localStorage.setItem(this.state.CHUNKED_PROMPTS_STORAGE_KEY, JSON.stringify(this.state.chunkedPromptsData))
            localStorage.setItem(this.state.USER_PROMPTS_STORAGE_KEY, JSON.stringify(userPromptsData))
            localStorage.setItem(this.state.USER_RESULTS_STORAGE_KEY, JSON.stringify(userResultsData))
          })
        }
      }
    })
  }

  copyToClipboard(languageType) {
    if (navigator.clipboard) {
      if (languageType === 'All') {
        const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
        navigator.clipboard.writeText(normalizedResponseResult)
          .then(() => this.setState({
            areCodesCopied: true,
            isHTMLCodeCopied: false,
            isCSSCodeCopied: false,
            isJSCodeCopied: false
          }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: this.props.t('copy_codes_fail.0'),
              text: error.message,
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            })
            this.setState({ areCodesCopied: false })
          })
      } else if (languageType === 'HTML') {
        const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
        const htmlOnly = normalizedResponseResult.replace(/<style>[\s\S]*?<\/style>/gi, '<link rel="stylesheet" href="styles.css">').replace(/<script>[\s\S]*?<\/script>/gi, '<script src="scripts.js"></script>').replace(/<style>[\s\S]*?<\/style>/gi, '').trim()
        navigator.clipboard.writeText(htmlOnly)
          .then(() => this.setState({
            isHTMLCodeCopied: true,
            areCodesCopied: false,
            isCSSCodeCopied: false,
            isJSCodeCopied: false
          }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: this.props.t('copy_html_fail'),
              text: error.message,
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            })
            this.setState({ isHTMLCodeCopied: false })
          })
      } else if (languageType === 'CSS') {
        const cssOnly = `${this.state.responseResult.replace(/^[\s\S]*?<style>|<\/style>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```/gm, '').trim()}`
        navigator.clipboard.writeText(cssOnly)
          .then(() => this.setState({
            isCSSCodeCopied: true,
            areCodesCopied: false,
            isHTMLCodeCopied: false,
            isJSCodeCopied: false
          }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: this.props.t('copy_css_fail'),
              text: error.message,
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            })
            this.setState({ isCSSCodeCopied: false })
          })
      } else if (languageType === 'JS') {
        const jsOnly = `${this.state.responseResult.replace(/^[\s\S]*?<script>|<\/script>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```[\s\S]*$/gm, '').trim()}`
        navigator.clipboard.writeText(jsOnly)
          .then(() => this.setState({
            isJSCodeCopied: true,
            areCodesCopied: false,
            isHTMLCodeCopied: false,
            isCSSCodeCopied: false
          }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: this.props.t('copy_js_fail'),
              text: error.message,
              confirmButtonColor: 'blue',
              confirmButtonText: this.props.t('ok')
            })
            this.setState({ isJSCodeCopied: false })
          })
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: this.props.t('copy_codes_fail.0'),
        text: this.props.t('copy_codes_fail.1'),
        confirmButtonColor: 'blue',
        confirmButtonText: this.props.t('ok')
      })
      this.setState({ areCodesCopied: false })
    }
  }

  openDownloadModal() {
    this.setState({ isDialogOpened: true })
  }

  downloadAsHTML() {
    const htmlResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
    const blob = new Blob([htmlResponseResult], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'generated-index.html'
    link.click()
    this.cancelDownload()
    URL.revokeObjectURL(url)
  }

  downloadAsZip() {
    const zip = new JSZip()
    const htmlResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
    const normalizedHtml = htmlResponseResult.replace(/<style>[\s\S]*?<\/style>/gi, '<link rel="stylesheet" href="styles.css">').replace(/<script>[\s\S]*?<\/script>/gi, '<script src="scripts.js"></script>').replace(/<style>[\s\S]*?<\/style>/gi, '').trim()
    const cssOnly = `${this.state.responseResult.replace(/^[\s\S]*?<style>|<\/style>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```/gm, '').trim()}`
    const jsOnly = `${this.state.responseResult.replace(/^[\s\S]*?<script>|<\/script>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```[\s\S]*$/gm, '').trim()}`
    const blob = new Blob([this.state.responseResult], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    zip.file('index.html', normalizedHtml)
    if (this.state.responseResult.includes('<style>')) zip.file('styles.css', cssOnly)
    if (this.state.responseResult.includes('<script>'))zip.file('scripts.js', jsOnly)
    zip.generateAsync({ type: 'blob' }).then(content => {
      const zipFile = new Blob([content], { type: 'application/zip' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipFile)
      link.download = 'generated-site.zip'
      link.click()
      this.cancelDownload()
      URL.revokeObjectURL(url)
    }).catch(error => {
      Swal.fire({
        icon: 'error',
        title: this.props.t('download_fail'),
        text: error.message,
        confirmButtonColor: 'blue',
        confirmButtonText: this.props.t('ok')
      })
    })
  }

  saveTempWebPreview() {
    if (isStorageExist(this.props.t('browser_warning'))) {
      const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
      localStorage.setItem(this.state.TEMP_WEB_PREVIEW_STORAGE_KEY, JSON.stringify(normalizedResponseResult))
    }
  }

  cancelDownload() {
    this.setState({ isDialogOpened: false })
  }

  changeTextView() {
    this.setState(prevState => ({ areTextsWrapped: !prevState.areTextsWrapped }))
  }

  render() {
    return (
      <main className="main-container h-full lg:grow w-full flex flex-col overflow-y-auto">
        <section className="grid grid-flow-row w-full lg:grid-cols-2 lg:h-3/5">
          <PromptContainer
            t={this.props.t}
            isDataWillBeSaved={this.props.state.isDataWillBeSaved}
            state={this.state}
            fileInputRef={this.fileInputRef}
            tempSettingInfoRef={this.tempSettingInfoRef}
            tempSettingContentInfoRef={this.tempSettingContentInfoRef}
            showTempSettingInfo={this.showTempSettingInfo.bind(this)}
            handleTempChange={this.handleTempChange.bind(this)}
            changeGeminiModel={this.changeGeminiModel.bind(this)}
            handleCurrentPromptChange={this.handleCurrentPromptChange.bind(this)}
            handleLastPromptChange={this.handleLastPromptChange.bind(this)}
            pickCurrentImages={this.pickCurrentImages.bind(this)}
            takeScreenshot={this.takeScreenshot.bind(this)}
            pickLastImages={this.pickLastImages.bind(this)}
            removeCurrentImage={this.removeCurrentImage.bind(this)}
            removeLastImages={this.removeLastImages.bind(this)}
            generatePrompt={this.generatePrompt.bind(this)}
            regeneratePrompt={this.regeneratePrompt.bind(this)}
            stopPrompt={this.stopPrompt.bind(this)}
            onEditHandler={this.onEditHandler.bind(this)}
            onCancelHandler={this.onCancelHandler.bind(this)}
            toggleSidebar={this.toggleSidebar.bind(this)}
            searchHandler={this.searchHandler.bind(this)}
            sortHandler={this.sortHandler.bind(this)}
            closeSidebar={this.closeSidebar.bind(this)}
            deleteAllPrompts={this.deleteAllPrompts.bind(this)}
            deleteSelectedPrompt={this.deleteSelectedPrompt.bind(this)}
          />
          <PreviewContainer
            t={this.props.t}
            iframeRef={this.iframeRef}
            isLoading={this.state.isLoading}
            isGenerating={this.state.isGenerating}
            responseResult={this.state.responseResult}
            areCodesCopied={this.state.areCodesCopied}
            copyToClipboard={this.copyToClipboard.bind(this)}
            openDownloadModal={this.openDownloadModal.bind(this)}
            saveTempWebPreview={this.saveTempWebPreview.bind(this)}
          />
        </section>
        <section className="grid grid-flow-row items-stretch w-screen md:w-full lg:grid-cols-3 lg:grow">
          <HtmlCodeContainer
            t={this.props.t}
            isDarkMode={this.props.state.isDarkMode}
            isLoading={this.state.isLoading}
            isGenerating={this.state.isGenerating}
            responseResult={this.state.responseResult}
            areTextsWrapped={this.state.areTextsWrapped}
            isHTMLCodeCopied={this.state.isHTMLCodeCopied}
            changeTextView={this.changeTextView.bind(this)}
            copyToClipboard={this.copyToClipboard.bind(this)}
          />
          <CssCodeContainer
            t={this.props.t}
            isDarkMode={this.props.state.isDarkMode}
            isLoading={this.state.isLoading}
            isGenerating={this.state.isGenerating}
            responseResult={this.state.responseResult}
            areTextsWrapped={this.state.areTextsWrapped}
            isCSSCodeCopied={this.state.isCSSCodeCopied}
            changeTextView={this.changeTextView.bind(this)}
            copyToClipboard={this.copyToClipboard.bind(this)}
          />
          <JsCodeContainer
            t={this.props.t}
            isDarkMode={this.props.state.isDarkMode}
            isLoading={this.state.isLoading}
            isGenerating={this.state.isGenerating}
            responseResult={this.state.responseResult}
            areTextsWrapped={this.state.areTextsWrapped}
            isJSCodeCopied={this.state.isJSCodeCopied}
            changeTextView={this.changeTextView.bind(this)}
            copyToClipboard={this.copyToClipboard.bind(this)}
          />
        </section>
        <UserDataEntry
          t={this.props.t}
          inputRef={this.inputRef}
          isUserDataEntered={this.props.state.isUserDataEntered}
          isFocused={this.props.state.isFocused}
          isDataWillBeSaved={this.props.state.isDataWillBeSaved}
          inputType={this.props.state.inputType}
          userName={this.props.state.userName}
          geminiApiKey={this.props.state.geminiApiKey}
          handleNameChange={this.props.handleNameChange}
          handleApiKeyChange={this.props.handleApiKeyChange}
          onFocusHandler={this.props.onFocusHandler}
          onBlurHandler={this.props.onBlurHandler}
          changeVisibilityPassword={this.props.changeVisibilityPassword}
          changeUserDataSetting={this.props.changeUserDataSetting}
          saveUserData={this.props.saveUserData}
        />
        <DownloadFileModal
          t={this.props.t}
          inputRef={this.inputRef}
          isDialogOpened={this.state.isDialogOpened}
          downloadAsHTML={this.downloadAsHTML.bind(this)}
          downloadAsZip={this.downloadAsZip.bind(this)}
          cancelDownload={this.cancelDownload.bind(this)}
        />
      </main>
    )
  }
}

export default MainContainer