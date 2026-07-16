export type FileAsset = {
  fileId: string
  fileName: string
  mimeType: string
  fileSizeBytes: number
  url: string
  createdAt: string
}

export type FileUploadConstraint = {
  allowedMimeTypes: string[]
  allowedExtensions: string[]
  maxSizeBytes: number
}

export type ProfileUploadPolicy = {
  profilePhoto: FileUploadConstraint
  certificateEvidence: FileUploadConstraint
}
