export type UUID = string
/**
 * типы входящих сообщений
 */
export const IncomingWsEvents = {
  /** когда клиент подключается */
  CONNECT: 'CONNECT',
  /** когда в клиенте нажали СТАРТ, распознавание стартует */
  START: 'START',
  /** когда в клиенте нажали СТОП, распознавание останавливается */
  STOP: 'STOP',
  /** когда клиент отправляет файлы для распознавания */
  POST_FILES: 'POST_FILES',
} as const;
export type IncomingWsEvent = typeof IncomingWsEvents[keyof typeof IncomingWsEvents];

export type BaseIncomingMessage = {
  type: IncomingWsEvent,
  clientID: UUID
}

export interface ConnectMessageType extends BaseIncomingMessage {}
export interface StartMessageType extends BaseIncomingMessage {}
export interface StopMessageType extends BaseIncomingMessage {}
export interface PostFilesMessageType extends BaseIncomingMessage {
  files: Array<{ filename: string, content: string }>
}

export type IncomingMessageType = StartMessageType | StopMessageType





/**
 * типы исходящих сообщений
 */
export const OutgoingWsEvents = {
  /** сервер запрашивает файлы у клиента, когда клиент отправляет СТАРТ */
  GET_FILES: 'GET_FILES',
  /** сервер обновляет статус файла на экране клиента */
  SET_FILE_STATE: 'SET_FILE_STATE',
} as const;
export type OutgoingWsEvent = typeof OutgoingWsEvents[keyof typeof OutgoingWsEvents];

export type BaseOutgoingMessage = {
  type: OutgoingWsEvent
}

export interface GetFilesMessageType extends BaseOutgoingMessage {
  /** сервер запршивает нужное количество файлов */
  count: number
}

export const FileStates = {
  /** файл ожиадет в очереди */
  WAITING: 'WAITING',
  /** файл полностью распознан */
  RECOGNIZED: 'RECOGNIZED',
  /** файл распозанется */
  RECOGNIZING: 'RECOGNIZING',
  /** файл на верификации */
  ON_VERIFICATION: 'ON_VERIFICATION',
  /** ошибка при распознавании */
  FAILED: 'FAILED',
} as const
export type FileStateType = typeof FileStates[keyof typeof FileStates]
    
export interface SetFileStateMessageType extends BaseOutgoingMessage {
  filename: string,
  state: FileStateType
}
export type OutgoingMessageType = GetFilesMessageType | SetFileStateMessageType