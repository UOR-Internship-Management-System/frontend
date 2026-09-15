import { useEffect, useRef, useState } from 'react'
import { useNotifications } from '../../../app/providers/NotificationProvider'
import { mapApiError } from '../../../shared/api/apiErrorMapper'
import { FileUploadField } from '../../../shared/components/forms/FileUploadField'
import { ConfirmDialog } from '../../../shared/components/overlays/ConfirmDialog'
import { Button } from '../../../shared/components/ui/Button'
import { useProfilePhotoMutations } from '../hooks/useProfileFiles'
import {
  fileAcceptValue,
  formatFileSize,
  validateProfileFile,
} from '../mappers/profileFileValidation'
import type { FileUploadConstraint } from '../types/profileFileTypes'

export type AvatarUploadProps = {
  fullName: string
  photoUrl: string | null
  version: number
  policy?: FileUploadConstraint
}

function initialsFor(fullName: string) {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'ST'
  )
}

export function AvatarUpload({ fullName, photoUrl, policy, version }: AvatarUploadProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const mutations = useProfilePhotoMutations()
  const { notify } = useNotifications()
  const displayedUrl = previewUrl ?? (!imageFailed ? photoUrl : null)

  useEffect(() => setImageFailed(false), [photoUrl])
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    },
    [previewUrl],
  )

  const selectFile = (file?: File) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setSelectedFile(null)
    setFileError(null)
    if (!file || !policy) return
    const error = validateProfileFile(file, policy)
    if (error) {
      setFileError(error)
      return
    }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const upload = async () => {
    if (!selectedFile) return
    try {
      await mutations.upload.mutateAsync({ file: selectedFile, version })
      notify({
        tone: 'success',
        title: 'Profile picture updated',
        message: 'The server confirmed your new profile picture.',
      })
      setSelectedFile(null)
      setPreviewUrl(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (error) {
      const mapped = mapApiError(error, 'protected')
      setFileError(mapped.message)
      setSelectedFile(null)
      setPreviewUrl(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = async () => {
    try {
      await mutations.remove.mutateAsync(version)
      setConfirmRemove(false)
      notify({
        tone: 'success',
        title: 'Profile picture removed',
        message: 'Your initials are now shown.',
      })
    } catch (error) {
      const mapped = mapApiError(error, 'protected')
      notify({ tone: 'error', title: 'Unable to remove picture', message: mapped.message })
    }
  }

  return (
    <div className="profile-photo-control">
      <div className="profile-avatar-wrapper">
        {displayedUrl ? (
          <img
            alt={`${fullName} profile`}
            className="profile-avatar"
            onError={() => setImageFailed(true)}
            referrerPolicy="no-referrer"
            src={displayedUrl}
          />
        ) : (
          <div
            aria-label={`${fullName} profile placeholder`}
            className="profile-avatar-fallback"
            role="img"
          >
            {initialsFor(fullName)}
          </div>
        )}
        <label
          className="profile-avatar-camera-btn"
          htmlFor="profile-avatar-file-input"
          title={photoUrl ? 'Change picture' : 'Select picture'}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            photo_camera
          </span>
        </label>
      </div>

      <FileUploadField
        accept={policy ? fileAcceptValue(policy) : undefined}
        aria-label={photoUrl ? 'Change picture' : 'Select picture'}
        className="visually-hidden"
        disabled={!policy || mutations.upload.isPending}
        id="profile-avatar-file-input"
        onChange={(event) => selectFile(event.target.files?.[0])}
        ref={inputRef}
      />

      <label
        className={`button m3-button m3-button--tonal m3-button--small profile-photo-trigger-btn ${
          !policy || mutations.upload.isPending ? 'disabled' : ''
        }`}
        htmlFor="profile-avatar-file-input"
      >
        <span className="button-content">
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
            style={{ fontSize: '18px' }}
          >
            add_a_photo
          </span>
          <span>{photoUrl ? 'Change picture' : 'Select picture'}</span>
        </span>
      </label>

      {policy ? (
        <div className="profile-policy-badge">
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
            style={{ fontSize: '15px' }}
          >
            info
          </span>
          <span>
            {policy.allowedExtensions.join(', ')} · Max {formatFileSize(policy.maxSizeBytes)}
          </span>
        </div>
      ) : (
        <p className="field-hint">
          Picture controls are unavailable until the upload policy loads.
        </p>
      )}
      {fileError ? (
        <p className="form-error" role="alert">
          {fileError}
        </p>
      ) : null}
      <div className="profile-photo-actions">
        {selectedFile ? (
          <Button
            icon={
              <span className="material-symbols-outlined" aria-hidden="true">
                cloud_upload
              </span>
            }
            isLoading={mutations.upload.isPending}
            onClick={() => void upload()}
            variant="primary"
          >
            Upload picture
          </Button>
        ) : null}
        {selectedFile ? (
          <Button
            disabled={mutations.upload.isPending}
            onClick={() => selectFile()}
            variant="secondary"
          >
            Cancel preview
          </Button>
        ) : null}
        {photoUrl ? (
          <Button
            disabled={mutations.remove.isPending}
            icon={
              <span className="material-symbols-outlined" aria-hidden="true">
                delete
              </span>
            }
            onClick={() => setConfirmRemove(true)}
            variant="outlined"
          >
            Remove picture
          </Button>
        ) : null}
      </div>
      {confirmRemove ? (
        <ConfirmDialog
          closeDisabled={mutations.remove.isPending}
          onClose={() => setConfirmRemove(false)}
          title="Remove profile picture"
        >
          <p>Your initials will replace the current picture.</p>
          <div className="modal-actions">
            <Button
              disabled={mutations.remove.isPending}
              onClick={() => setConfirmRemove(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              isLoading={mutations.remove.isPending}
              onClick={() => void remove()}
              variant="danger"
            >
              Remove picture
            </Button>
          </div>
        </ConfirmDialog>
      ) : null}
    </div>
  )
}
