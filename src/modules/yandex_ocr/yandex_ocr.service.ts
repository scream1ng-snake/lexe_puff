import { Injectable, Logger } from '@nestjs/common';
import { OnModuleInit } from '@nestjs/common/interfaces';
import { WsGateway } from '../websocket/websocket.provider';
import { FileStates, OutgoingWsEvents, PostFilesMessageType } from '../websocket/websocket.types';
import * as events from 'events'
import axios from 'axios'
import { MimeType, MimeTypes, ModelType, ModelTypes, Optional, UUID } from './yandex_ocr.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YandexOCR_Service implements OnModuleInit {
  constructor(
    private wsGateway: WsGateway, 
    private configService: ConfigService
  ) {}
  /** IAM токен от Яндекс облака */
  IAMToken: Optional<string> = null
  IAMTokenExpAt: Optional<Date> = null
  IAMTokenUpdaterId: Optional<ReturnType<typeof setInterval>> = null

  /** 
   * кол-во висящих запросов к апи. 
   * Это учитывается чтобы не поймать memory heap allocated
   */
  currentPendingRequests = 0

  /** клиенты, где нажали старт */
  readyClients: Map<UUID, boolean> = new Map()

  settings = {
    /**
     * макс. кол-во висящих запросов к апи
     * такое ограничение чтобы не поймать memory heap allocated
     */
    maxPooledRequests: 5,
    serviceUrl: 'https://ocr.api.cloud.yandex.net/ocr/v1/recognizeText',
    tokensUrl: 'https://iam.api.cloud.yandex.net/iam/v1/tokens'
  }
  
  async onModuleInit() {
    if(!this.IAMToken) await this.updateIAM()
    // сетаем кое-какие интрецепторы на запросы
    axios.interceptors.request.use(
      config => {
        this.currentPendingRequests++
        return config;
      }, 
      error => Promise.reject(error)
    )

    const decrementer = () => {
      this.currentPendingRequests--
      // как только освободилось место, сразу запрашиваем 
      // файлы у запущенных клиентов
      this.readyClients.forEach((isReady, clientId) => {
        if(isReady) {
          this.wsGateway.sendMessageByClientID(clientId, {
            type: 'GET_FILES',
            count: this.settings.maxPooledRequests - this.currentPendingRequests
          })
        }
      }) 
    }
    axios.interceptors.response.use(
      response => {
        decrementer()
        return response
      }, 
      error => {
        decrementer()
        return Promise.reject(error)
      }
    )

    // подписываемся на сообщения из сокета
    this.wsGateway.subscribeToMessage(msg => {
      switch (msg.type) {
        // если клиент готов, то запрашиваем у него файлы 
        case 'START':
          this.readyClients.set(msg.clientID, true)
          this.wsGateway.sendMessageByClientID(msg.clientID, {
            type: 'GET_FILES',
            count: this.settings.maxPooledRequests - this.currentPendingRequests
          })
          break;
        // если клиент отправил нам файлы то отправляем их на распознавание
        case 'POST_FILES':
          const { clientID, files } = msg as PostFilesMessageType
          for(const { filename, content } of files) {
            let mimeType = filename
              ?.split('.')
              ?.pop()
              ?.toUpperCase()

            if(mimeType === "JPG") mimeType = "JPEG"
            if(Object.keys(MimeTypes).includes(mimeType)) {
              this.wsGateway.sendMessageByClientID(clientID, {
                type: OutgoingWsEvents.SET_FILE_STATE, 
                filename,
                state: FileStates.RECOGNIZING
              })
              this.sendRequestToOCR(
                mimeType as MimeType, 
                ModelTypes.handwritten, 
                content, 
                filename, 
                clientID
              )
                .then(response => {
                  this.wsGateway.sendMessageByClientID(clientID, {
                    type: OutgoingWsEvents.SET_FILE_STATE, 
                    filename,
                    state: FileStates.RECOGNIZED
                  })
                })
                .catch(err => {
                  // console.error(err)
                  this.wsGateway.sendMessageByClientID(clientID, {
                    type: OutgoingWsEvents.SET_FILE_STATE, 
                    filename,
                    state: FileStates.FAILED
                  })
                })
            } else {
              throw new Error('Incorrected mimetype - ' + mimeType)
            }
          }
          break;
        case 'STOP':
          this.readyClients.set(msg.clientID, false)
          break
        default:
          break;
      }
    })
    
  }

  async updateIAM() {
    const OAuthToken = this.configService.get<string>("yandex.OAuth")
    const body = { "yandexPassportOauthToken": OAuthToken }
    const headers = { 'Content-Type': 'application/json' }
    type resultIAM = {
      iamToken: string, 
      expiresAt: string
    }
    const { data, status } = await axios.post<resultIAM>(
      this.settings.tokensUrl, 
      body, 
      { headers }
    )
    if(status === 200) {
      this.IAMToken = data.iamToken,
      this.IAMTokenExpAt = new Date(data.expiresAt)
      this.IAMTokenUpdaterId = setInterval(() => {
        const fiveMins = 1000 * 60 * 5
        if(Date.now() >= (this.IAMTokenExpAt.getTime() - fiveMins)) {
          Logger.log("IAM token expires now, trying refresh IAM token", "[Yandex OCR provider]")
          this.updateIAM()
        }
      }, 60000)
    }
  }

  sendRequestToOCR = async (
    mimeType: MimeType, 
    model: ModelType, 
    b64encoded: string,
    filename: string,
    clientID: UUID
  ) => {
    const XFolderId = this.configService.get<string>('yandex.XFolderId')
    if(!XFolderId) throw new Error("yandex.XFolderId is not provided")
    const body = { 
      mimeType, 
      model, 
      content: b64encoded, 
      languageCodes: ["ru"], 
    }
    if(!this.IAMToken) await this.updateIAM()
    const headers = {
      Authorization: 'Bearer ' + this.IAMToken,
      'Content-Type': 'application/json',
      'x-folder-id': XFolderId,
      'x-data-logging-enabled': 'true'
    }
    return axios
      .post(this.settings.serviceUrl, body, { headers })
      .then(async response => {
        if(response.status === 401) {
          await this.updateIAM()
          return this.sendRequestToOCR(mimeType, model, b64encoded, filename, clientID)
        } else if(response.status === 200) {
          return response
        }
      })
  }
}
