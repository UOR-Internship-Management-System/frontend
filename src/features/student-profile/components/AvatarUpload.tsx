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
      <FileUploadField
        accept={policy ? fileAcceptValue(policy) : undefined}
        aria-label={photoUrl ? 'Change Picture' : 'Select Picture'}
        disabled={!policy || mutations.upload.isPending}
        onChange={(event) => selectFile(event.target.files?.[0])}
        ref={inputRef}
      />
      {policy ? (
        <p className="field-hint">
          {policy.allowedExtensions.join(', ')} · Maximum {formatFileSize(policy.maxSizeBytes)}
        </p>
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
          <Button isLoading={mutations.upload.isPending} onClick={() => void upload()}>
            Upload Picture
          </Button>
        ) : null}
        {selectedFile ? (
          <Button
            disabled={mutations.upload.isPending}
            onClick={() => selectFile()}
            variant="secondary"
          >
            Cancel Preview
          </Button>
        ) : null}
        {photoUrl ? (
          <Button
            disabled={mutations.remove.isPending}
            onClick={() => setConfirmRemove(true)}
            variant="secondary"
          >
            Remove Picture
          </Button>
        ) : null}
      </div>
      {confirmRemove ? (
        <ConfirmDialog
          closeDisabled={mutations.remove.isPending}
          onClose={() => setConfirmRemove(false)}
          title="Remove Profile Picture"
        >
          <p>Your initials will replace the current picture.</p>
          <div className="modal-actions">
            <Button
              disabled={mutations.remove.isPending}
              onClick={() => setConfirmRemove(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button isLoading={mutations.remove.isPending} onClick={() => void remove()}>
              Remove Picture
            </Button>
          </div>
        </ConfirmDialog>
      ) : null}
    </div>
  )
}
