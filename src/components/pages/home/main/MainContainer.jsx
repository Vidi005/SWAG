import React from "react"
import UserDataEntry from "../pop_up/UserDataEntry"
import PromptContainer from "./PromptContainer"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import PreviewContainer from "./PreviewContainer"
import Swal from "sweetalert2"
import HtmlCodeContainer from "./HtmlCodeContainer"
import CssCodeContainer from "./CssCodeContainer"
import JsCodeContainer from "./JsCodeContainer"
import { fileToGenerativePart } from "../../../../utils/data"
import DownloadFileModal from "../pop_up/DownloadFileModal"
import JSZip from "jszip"

class MainContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      USER_CHATS_STORAGE_KEY: 'USER_CHATS_STORAGE_KEY',
      genAIModel: 'gemini-1.5-flash',
      isLoading: false,
      isEditing: false,
      isGenerating: false,
      currentPrompt: '',
      lastPrompt: '',
      imgFile: null,
      abortController: null,
      filteredPrompt: 'Create a single HTML file without any backend code. If using front-end web libraries, import them only from a CDN and write the code within the <script> tag. If using native CSS, include it as inline CSS within the HTML code. If using JavaScript, write it as inline JavaScript within the HTML code. Provide only the complete HTML code without any additional explanations or descriptions.',
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
          confirmButtonColor: 'blue'
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
          responseResult: 'The prompt is too long. Please try again.',
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
          title: 'Error',
          text: `${error.message}`,
          confirmButtonColor: 'blue'
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
      const model = genAI.getGenerativeModel({ model: this.state.genAIModel, safetySettings })
      this.postPrompt(model, this.state.currentPrompt)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: 'blue'
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
      const model = genAI.getGenerativeModel({ model: this.state.genAIModel, safetySettings })
      this.postPrompt(model, this.state.lastPrompt)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: 'blue'
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
          .then(() => this.setState({ areCodesCopied: true }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: 'Can\'t Copy any Codes',
              text: error.message,
              confirmButtonColor: 'blue'
            })
            this.setState({ areCodesCopied: false })
          })
      } else if (languageType === 'HTML') {
        const normalizedResponseResult = `<!DOCTYPE html>\n<html lang="en">\n  ${this.state.responseResult.replace(/^[\s\S]*?<html[\s\S]*?>|<\/html>[\s\S]*$/gm, '').replace(/\n/gm, '\n  ').replace(/```/gm, '').trim()}\n</html>`
        const htmlOnly = normalizedResponseResult.replace(/<style>[\s\S]*?<\/style>/gi, '<link rel="stylesheet" href="styles.css">').replace(/<script>[\s\S]*?<\/script>/gi, '<script src="scripts.js"></script>').replace(/<style>[\s\S]*?<\/style>/gi, '').trim()
        navigator.clipboard.writeText(htmlOnly)
          .then(() => this.setState({ isHTMLCodeCopied: true }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: 'Can\'t Copy HTML Code',
              text: error.message,
              confirmButtonColor: 'blue'
            })
            this.setState({ isHTMLCodeCopied: false })
          })
      } else if (languageType === 'CSS') {
        const cssOnly = `${this.state.responseResult.replace(/^[\s\S]*?<style>|<\/style>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```/gm, '').trim()}`
        navigator.clipboard.writeText(cssOnly)
          .then(() => this.setState({ isCSSCodeCopied: true }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: 'Can\'t Copy CSS Code',
              text: error.message,
              confirmButtonColor: 'blue'
            })
            this.setState({ isCSSCodeCopied: false })
          })
      } else if (languageType === 'JS') {
        const jsOnly = `${this.state.responseResult.replace(/^[\s\S]*?<script>|<\/script>[\s\S]*$/gm, '').replace(/\n    /gm, '\n').replace(/```[\s\S]*$/gm, '').trim()}`
        navigator.clipboard.writeText(jsOnly)
          .then(() => this.setState({ isJSCodeCopied: true }))
          .catch(error => {
            Swal.fire({
              icon: 'error',
              title: 'Can\'t Copy JS Code',
              text: error.message,
              confirmButtonColor: 'blue'
            })
            this.setState({ isJSCodeCopied: false })
          })
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Can\'t Copy any Codes',
        text: 'Clipboard API is not supported',
        confirmButtonColor: 'blue'
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
        title: 'Can\'t Download File',
        text: error.message,
        confirmButtonColor: 'blue'
      })
    })
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
            isLoading={this.state.isLoading}
            responseResult={this.state.responseResult}
            areCodesCopied={this.state.areCodesCopied}
            copyToClipboard={this.copyToClipboard.bind(this)}
            openDownloadModal={this.openDownloadModal.bind(this)}
          />
        </section>
        <section className="grid grid-flow-row items-stretch w-full lg:grid-cols-3 lg:grow">
          <HtmlCodeContainer
            isDarkMode={this.props.state.isDarkMode}
            isLoading={this.state.isLoading}
            responseResult={this.state.responseResult}
            areTextsWrapped={this.state.areTextsWrapped}
            isHTMLCodeCopied={this.state.isHTMLCodeCopied}
            changeTextView={this.changeTextView.bind(this)}
            copyToClipboard={this.copyToClipboard.bind(this)}
          />
          <CssCodeContainer
            isDarkMode={this.props.state.isDarkMode}
            isLoading={this.state.isLoading}
            responseResult={this.state.responseResult}
            areTextsWrapped={this.state.areTextsWrapped}
            isCSSCodeCopied={this.state.isCSSCodeCopied}
            changeTextView={this.changeTextView.bind(this)}
            copyToClipboard={this.copyToClipboard.bind(this)}
          />
          <JsCodeContainer
            isDarkMode={this.props.state.isDarkMode}
            isLoading={this.state.isLoading}
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