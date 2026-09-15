import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ActivityEditor } from '../components/ActivityEditor'
import { AwardEditor } from '../components/AwardEditor'
import { CertificateEditor } from '../components/CertificateEditor'
import { ContactLinkEditor } from '../components/ContactLinkEditor'
import { ExperienceEditor } from '../components/ExperienceEditor'

const cancel = () => undefined

const submitLink = async () => undefined
const submitCertificate = async () => undefined
const submitAward = async () => undefined
const submitActivity = async () => undefined
const submitExperience = async () => undefined

describe('Student Profile editor content', () => {
  afterEach(cleanup)

  it('uses the approved wireframe labels while retaining contract-backed fields', () => {
    render(<ContactLinkEditor isPending={false} onCancel={cancel} onSubmit={submitLink} />)
    expect(screen.getByLabelText('Link label')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Include this professional link in the CV' }),
    ).toBeInTheDocument()

    cleanup()
    render(<CertificateEditor isPending={false} onCancel={cancel} onSubmit={submitCertificate} />)
    expect(screen.getByLabelText('Certification name')).toBeInTheDocument()
    expect(screen.getByLabelText('Issuing authority')).toBeInTheDocument()
    expect(screen.getByLabelText('Date issued')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('Credential URL')).toHaveAttribute('type', 'url')
    expect(screen.getByLabelText('Certificate evidence (optional)')).toBeDisabled()
    expect(
      screen.getByRole('checkbox', { name: 'Include this certificate in the CV' }),
    ).toBeInTheDocument()

    cleanup()
    render(<AwardEditor isPending={false} onCancel={cancel} onSubmit={submitAward} />)
    expect(screen.getByLabelText('Award or achievement title')).toBeInTheDocument()
    expect(screen.getByLabelText('Awarding institution or organization')).toBeInTheDocument()
    expect(screen.getByLabelText('Date received')).toHaveAttribute('type', 'date')
    expect(
      screen.getByRole('checkbox', { name: 'Include this award in the CV' }),
    ).toBeInTheDocument()

    cleanup()
    render(<ActivityEditor isPending={false} onCancel={cancel} onSubmit={submitActivity} />)
    expect(screen.getByLabelText('Organization, club, or society name')).toBeInTheDocument()
    expect(screen.getByLabelText('Role or position held')).toBeInTheDocument()
    expect(screen.getByLabelText('Core responsibilities')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Include this activity in the CV' }),
    ).toBeInTheDocument()

    cleanup()
    render(<ExperienceEditor isPending={false} onCancel={cancel} onSubmit={submitExperience} />)
    expect(screen.getByLabelText('Company')).toBeInTheDocument()
    expect(screen.getByLabelText('Job title')).toBeInTheDocument()
    expect(screen.getByLabelText('Job location')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'This is my current role' })).toBeInTheDocument()
    expect(screen.getByLabelText('Core responsibilities or duties')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Include this experience in the CV' }),
    ).toBeInTheDocument()
  })
})
