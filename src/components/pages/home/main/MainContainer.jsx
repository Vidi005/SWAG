import React from "react"
import UserDataEntry from "../pop_up/UserDataEntry"
import PromptContainer from "./PromptContainer"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import PreviewContainer from "./PreviewContainer"
import Swal from "sweetalert2"
import HtmlCodeContainer from "./HtmlCodeContainer"
import CssCodeContainer from "./CssCodeContainer"
import JsCodeContainer from "./JsCodeContainer"
import { fileToGenerativePart, geminiAIModels, isStorageExist } from "../../../../utils/data"
import DownloadFileModal from "../pop_up/DownloadFileModal"
import JSZip from "jszip"

class MainContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      GEMINI_AI_MODEL_STORAGE_KEY: 'GEMINI_AI_MODEL_STORAGE_KEY',
      USER_CHATS_STORAGE_KEY: 'USER_CHATS_STORAGE_KEY',
      TEMP_WEB_PREVIEW_STORAGE_KEY: 'TEMP_WEB_PREVIEW_STORAGE_KEY',
      geminiAIModels: geminiAIModels,
      selectedModel: geminiAIModels[1],
      isLoading: false,
      isEditing: false,
      isGenerating: false,
      currentPrompt: '',
      lastPrompt: '',
      imgFile: null,
      abortController: null,
      filteredPrompt: this.props.t('filtered_prompt'),
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
    this.iframeRef = React.createRef()
  }

  componentDidMount() {
    this.loadSavedGeminiModel()
    addEventListener('beforeunload', () => {
      localStorage.removeItem(this.state.TEMP_WEB_PREVIEW_STORAGE_KEY)
    })
  }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.responseResult !== this.state.responseResult) this.scrollToBottom()
  }

  componentWillUnmount() {
    removeEventListener('beforeunload', () => {
      localStorage.removeItem(this.state.TEMP_WEB_PREVIEW_STORAGE_KEY)
    })
  }

  loadSavedGeminiModel() {
    const geminiAIModel = localStorage.getItem(this.state.GEMINI_AI_MODEL_STORAGE_KEY) || this.state.selectedModel.variant
    this.setState({ selectedModel: geminiAIModels.find(model => model.variant === geminiAIModel) })
  }

  changeGeminiModel(selectedVariant) {
    if (!this.state.isGenerating || !this.state.isLoading) {
      this.setState({ selectedModel: this.state.geminiAIModels.find(model => model.variant === selectedVariant) }, () => {
        localStorage.setItem(this.state.GEMINI_AI_MODEL_STORAGE_KEY, this.state.selectedModel.variant)
        if (this.state.selectedModel.variant !== 'multimodal') this.setState({ imgFile: null })
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

  pickImage(imgFiles) {
    if (imgFiles.length === 0) return
    const file = imgFiles[0]
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'heic', 'raw']
    const fileExtension = file.name.split('.').pop().toLowerCase()
    if (file) {
      const maxFileSize = 10 * 1024 * 1024
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
      if (validImageExtensions.includes(fileExtension)) {
        this.setState({ imgFile: file })
      }
    }
  }

  removeImage() {
    this.setState({ imgFile: null })
  }
  
  async postPrompt(model, userPrompt) {
    try {
      const { totalTokens } = await model.countTokens(`${userPrompt}. ${this.state.filteredPrompt}`)
      if (totalTokens > 10000) {
        this.setState({
          responseResult: this.props.t('prompt_token_limit'),
          isLoading: false
        })
      } else {
        this.setState({ lastPrompt: userPrompt })
        const abortController = new AbortController()
        this.setState({ abortController: abortController })
        if (this.state.imgFile) {
          const imageParts = await Promise.all([fileToGenerativePart(this.state.imgFile)])
          const result = await model.generateContentStream([`${userPrompt}.\n${this.state.filteredPrompt}`, ...imageParts], { signal: abortController.signal })
          let text = ''
          for await (const chunk of result.stream) {
            if (abortController.signal.aborted) break
            const chunkText = chunk.text()
            text += chunkText
            this.setState({
              currentPrompt: '',
              imgFile: null,
              responseResult: text,
              isLoading: false,
              isGenerating: true
            })
          }
          this.setState({ isGenerating: false })
        } else {
          const result = await model.generateContentStream(`${userPrompt}.\n${this.state.filteredPrompt}`, { signal: abortController.signal })
          let text = ''
          for await (const chunk of result.stream) {
            if (abortController.signal.aborted) break
            const chunkText = chunk.text()
            text += chunkText
            this.setState({
              currentPrompt: '',
              imgFile: null,
              responseResult: text,
              isLoading: false,
              isGenerating: true
            })
          }
          this.setState({ isGenerating: false })
        }
      }      
    } catch (error) {
      if (error.name !== 'AbortError') {
        Swal.fire({
          icon: 'error',
          title: this.props.t('send_prompt_fail'),
          text: `${error.message}`,
          confirmButtonColor: 'blue',
          confirmButtonText: this.props.t('ok')
        })
      }
      this.setState({ isLoading: false, isGenerating: false })
    }
  }

  generatePrompt() {
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
      const model = genAI.getGenerativeModel({ model: this.state.selectedModel?.variant, safetySettings })
      this.postPrompt(model, this.state.currentPrompt)
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
      const model = genAI.getGenerativeModel({ model: this.state.selectedModel?.variant, safetySettings })
      this.postPrompt(model, this.state.lastPrompt)
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

  async scrollToBottom() {
    if (this.state.responseResult.includes('<html')) {
      await this.iframeRef.current.contentWindow.scrollTo(0, 999999)
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

  onEditHandler() {
    this.setState({ isEditing: true })
  }

  onCancelHandler() {
    this.setState({ isEditing: false })
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
    const normalizedHtml = htmlResponseResult.replace(/<style>[\s\S]*?<\/style>/gi, '<link rel="stylesheet" href="styles.css">').replace(/<script>[\s\S]*?<\/script>/gi, '<script src="scripts.js"></script>').replace(/<style>[\s\S]*?<\/style>/gi, '').trim()
    const blob = new Blob([normalizedHtml], { type: 'text/html' })
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
    zip.file('styles.css', cssOnly)
    zip.file('scripts.js', jsOnly)
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
            state={this.state}
            changeGeminiModel={this.changeGeminiModel.bind(this)}
            handleCurrentPromptChange={this.handleCurrentPromptChange.bind(this)}
            handleLastPromptChange={this.handleLastPromptChange.bind(this)}
            pickImage={this.pickImage.bind(this)}
            removeImage={this.removeImage.bind(this)}
            generatePrompt={this.generatePrompt.bind(this)}
            regeneratePrompt={this.regeneratePrompt.bind(this)}
            stopPrompt={this.stopPrompt.bind(this)}
            onEditHandler={this.onEditHandler.bind(this)}
            onCancelHandler={this.onCancelHandler.bind(this)}
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
        <section className="grid grid-flow-row items-stretch w-full lg:grid-cols-3 lg:grow">
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
          userName={this.props.state.userName}
          geminiApiKey={this.props.state.geminiApiKey}
          handleNameChange={this.props.handleNameChange}
          handleApiKeyChange={this.props.handleApiKeyChange}
          onFocusHandler={this.props.onFocusHandler}
          onBlurHandler={this.props.onBlurHandler}
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