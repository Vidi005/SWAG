import React from "react"
import UserDataEntry from "../pop_up/UserDataEntry"
import PromptContainer from "./PromptContainer"
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"
import PreviewContainer from "./PreviewContainer"
import Swal from "sweetalert2"
import HtmlCodeContainer from "./HtmlCodeContainer"

class MainContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      USER_API_STORAGE_KEY: 'USER_API_STORAGE_KEY',
      USER_CHATS_STORAGE_KEY: 'USER_CHATS_STORAGE_KEY',
      isLoading: false,
      isEditing: false,
      isGenerating: false,
      currentPrompt: '',
      lastPrompt: '',
      imgFile: null,
      abortController: null,
      filteredPrompt: 'Create a single HTML file without any backend code. If using front-end web libraries, import them only from a CDN and write the code within the <script> tag. If using native CSS, include it as inline CSS within the HTML code. If using JavaScript, write it as inline JavaScript within the HTML code. Provide only the complete HTML code without any additional explanations or descriptions.',
      responseResult: '',
      userChatData: null
    }
    this.inputRef = React.createRef()
  }

  handleCurrentPromptChange(event) {
    this.setState({ currentPrompt: event.target.value })
  }

  handleLastPromptChange(event) {
    this.setState({ lastPrompt: event.target.value })
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

  async fileToGenerativePart(file) {
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
          const imageParts = await Promise.all([this.fileToGenerativePart(this.state.imgFile)])
          const result = await model.generateContentStream([`${userPrompt}.\n${this.state.filteredPrompt}`, ...imageParts], { signal: abortController.signal })
          let text = ''
          for await (const chunk of result.stream) {
            if (abortController.signal.aborted) break
            const chunkText = chunk.text()
            text += chunkText
            this.setState({ currentPrompt: '', responseResult: text, isLoading: false, isGenerating: true })
          }
          result.response.finally(() => {
            this.setState({ isGenerating: false })
          })
        } else {
          const result = await model.generateContentStream(`${userPrompt}.\n${this.state.filteredPrompt}`, { signal: abortController.signal })
          let text = ''
          for await (const chunk of result.stream) {
            if (abortController.signal.aborted) break
            const chunkText = chunk.text()
            text += chunkText
            this.setState({ currentPrompt: '', imgFile: null, responseResult: text, isLoading: false })
          }
          result.response.finally(() => {
            this.setState({ isGenerating: false })
          })
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
      this.setState({ isLoading: false })
    }
  }

  generatePrompt() {
    try {
      this.setState({ isLoading: true, lastPrompt: '', isEditing: false })
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
      ]
      const genAI = new GoogleGenerativeAI(this.props.state.geminiApiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings })
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
      this.setState({ isLoading: true, isEditing: false })
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
        }
      ]
      const genAI = new GoogleGenerativeAI(this.props.state.geminiApiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings })
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

  render() {
    return (
      <main className="main-container relative h-full lg:grow w-full flex flex-col overflow-y-auto">
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
          <PreviewContainer isLoading={this.state.isLoading} responseResult={this.state.responseResult}/>
        </section>
        <section className="grid grid-flow-row w-full lg:grid-cols-3 lg:grow">
          <HtmlCodeContainer isLoading={this.state.isLoading} responseResult={this.state.responseResult}/>
          <article className="h-[40vh] lg:h-full bg-cyan-100 dark:bg-cyan-900 duration-200"></article>
          <article className="h-[40vh] lg:h-full bg-yellow-100 dark:bg-yellow-900 duration-200"></article>
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
      </main>
    )
  }
}

export default MainContainer