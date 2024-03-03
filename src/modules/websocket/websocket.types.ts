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
} as const;
export type IncomingWsEvent = typeof IncomingWsEvents[keyof typeof IncomingWsEvents];

export type BaseIncomingMessage = {
  type: IncomingWsEvent
}

export interface ConnectMessageType extends BaseIncomingMessage {
  clientID: UUID
}
export interface StartMessageType extends BaseIncomingMessage {}
export interface StopMessageType extends BaseIncomingMessage {}

export type IncomingMessageType = StartMessageType | StopMessageType





/**
 * типы исходящих сообщений
 */
export const OutgoingWsEvents = {
  /** сервер запрашивает файлы у клиента, когда клиент отправляет СТАРТ */
  GET_FILES: 'GET_FILES'
} as const;
export type OutgoingWsEvent = typeof OutgoingWsEvents[keyof typeof OutgoingWsEvents];

export type BaseOutgoingMessage = {
  type: OutgoingWsEvent
}

export interface GetFilesMessageType extends BaseOutgoingMessage {
  /** сервер запршивает нужное количество файлов */
  count: number
}
export type OutgoingMessageType = GetFilesMessageType