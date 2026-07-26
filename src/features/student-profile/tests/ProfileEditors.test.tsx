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
    expect(screen.getByLabelText('Link Label')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Include this Professional Link in the CV' }),
    ).toBeInTheDocument()

    cleanup()
    render(<CertificateEditor isPending={false} onCancel={cancel} onSubmit={submitCertificate} />)
    expect(screen.getByLabelText('Certification Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Issuing Authority')).toBeInTheDocument()
    expect(screen.getByLabelText('Date Issued')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('Credential URL Reference')).toHaveAttribute('type', 'url')
    expect(screen.getByLabelText('Certificate Evidence (Optional)')).toBeDisabled()
    expect(
      screen.getByRole('checkbox', { name: 'Include this Certificate in the CV' }),
    ).toBeInTheDocument()

    cleanup()
    render(<AwardEditor isPending={false} onCancel={cancel} onSubmit={submitAward} />)
    expect(screen.getByLabelText('Award / Achievement Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Awarding Institution / Body')).toBeInTheDocument()
    expect(screen.getByLabelText('Date Received')).toHaveAttribute('type', 'date')
    expect(
      screen.getByRole('checkbox', { name: 'Include this Award in the CV' }),
    ).toBeInTheDocument()

    cleanup()
    render(<ActivityEditor isPending={false} onCancel={cancel} onSubmit={submitActivity} />)
    expect(screen.getByLabelText('Organization / Club / Society Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Role / Position Held')).toBeInTheDocument()
    expect(screen.getByLabelText('Core Responsibilities')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Include this Activity in the CV' }),
    ).toBeInTheDocument()

    cleanup()
    render(<ExperienceEditor isPending={false} onCancel={cancel} onSubmit={submitExperience} />)
    expect(screen.getByLabelText('Company')).toBeInTheDocument()
    expect(screen.getByLabelText('Job Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Job Location')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Is Current Role' })).toBeInTheDocument()
    expect(screen.getByLabelText('Core Responsibilities / Bulleted Duties')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Include this Experience in the CV' }),
    ).toBeInTheDocument()
  })
})
