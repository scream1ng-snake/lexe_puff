export type Optional<T> = T | null
export type Undef<T> = T | undefined
export type UUID = string


/** available mimetypes for yandex ocr */
export const MimeTypes = {
  JPEG: "JPEG",
  PNG: "PNG",
  PDF: "PDF"
} as const
export type MimeType = typeof MimeTypes[keyof typeof MimeTypes]

/** available ai models on yandex ocr */
export const ModelTypes = {
  handwritten: "handwritten", 
  table: "table", 
  passport: "passport", 
} as const
export type ModelType = typeof ModelTypes[keyof typeof ModelTypes]