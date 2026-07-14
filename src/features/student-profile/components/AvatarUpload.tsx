import { useEffect, useState } from 'react'

export type AvatarUploadProps = {
  fullName: string
  profilePhotoUrl: string | null
}

function initialsFor(fullName: string) {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'ST'
}

export function AvatarUpload({ fullName, profilePhotoUrl }: AvatarUploadProps) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => setImageFailed(false), [profilePhotoUrl])

  if (profilePhotoUrl && !imageFailed) {
    return (
      <img
        alt={`${fullName || 'Student'} profile`}
        className="profile-avatar"
        onError={() => setImageFailed(true)}
        referrerPolicy="no-referrer"
        src={profilePhotoUrl}
      />
    )
  }

  return (
    <div
      aria-label={`${fullName || 'Student'} profile placeholder`}
      className="profile-avatar-fallback"
      role="img"
    >
      {initialsFor(fullName)}
    </div>
  )
}
