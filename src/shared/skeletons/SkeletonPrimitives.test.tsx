import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  SkeletonCard,
  SkeletonFormFields,
  SkeletonListRows,
  SkeletonMetricGrid,
  SkeletonMobileCards,
  SkeletonPageHeader,
  SkeletonPagination,
  SkeletonShape,
  SkeletonStatusRegion,
  SkeletonTableGrid,
  SkeletonToolbar,
} from './SkeletonPrimitives'

describe('SkeletonShape', () => {
  it('renders a single decorative shimmer block', () => {
    const { container } = render(<SkeletonShape />)
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
  })
})

describe('SkeletonPageHeader', () => {
  it('renders the action shape only when requested', () => {
    const { container: withoutAction } = render(<SkeletonPageHeader />)
    const { container: withAction } = render(<SkeletonPageHeader action />)
    expect(withAction.querySelectorAll('.skeleton-page-header > *').length).toBeGreaterThan(
      withoutAction.querySelectorAll('.skeleton-page-header > *').length,
    )
  })
})

describe('SkeletonTableGrid', () => {
  it('renders columns header cells and columns x rows body cells', () => {
    const { container } = render(
      <SkeletonTableGrid columns={4} gridTemplateColumns="repeat(4, 1fr)" rows={3} />,
    )
    expect(container.querySelectorAll('[data-skeleton-header]')).toHaveLength(4)
    expect(container.querySelectorAll('[data-skeleton-cell]')).toHaveLength(12)
  })
})

describe('SkeletonPagination', () => {
  it('renders two shapes', () => {
    const { container } = render(<SkeletonPagination />)
    expect(container.querySelectorAll('.skeleton-pagination > *')).toHaveLength(2)
  })
})

describe('SkeletonMobileCards', () => {
  it('renders the requested number of cards', () => {
    const { container } = render(<SkeletonMobileCards count={3} />)
    expect(container.querySelectorAll('.skeleton-mobile-card')).toHaveLength(3)
  })
})

describe('SkeletonStatusRegion', () => {
  it('exposes role=status with the given accessible name', () => {
    render(
      <SkeletonStatusRegion label="Loading widgets">
        <span>content</span>
      </SkeletonStatusRegion>,
    )
    expect(screen.getByRole('status', { name: 'Loading widgets' })).toBeInTheDocument()
  })
})

describe('SkeletonCard', () => {
  it('renders a header shape by default and omits it when title=false', () => {
    const { container: withTitle } = render(<SkeletonCard />)
    const { container: withoutTitle } = render(<SkeletonCard title={false} />)
    expect(withTitle.querySelector('.skeleton-card-block-header')).not.toBeNull()
    expect(withoutTitle.querySelector('.skeleton-card-block-header')).toBeNull()
  })

  it('renders children content wrapper only when children are given', () => {
    const { container } = render(
      <SkeletonCard>
        <span>body</span>
      </SkeletonCard>,
    )
    expect(container.querySelector('.skeleton-card-block-content')).not.toBeNull()
  })
})

describe('SkeletonToolbar', () => {
  it('renders one shape per requested field', () => {
    const { container } = render(<SkeletonToolbar fields={3} />)
    expect(container.querySelectorAll('.skeleton-toolbar-row > *')).toHaveLength(3)
  })
})

describe('SkeletonListRows', () => {
  it('renders count row placeholders', () => {
    const { container } = render(<SkeletonListRows count={5} />)
    expect(container.querySelectorAll('.skeleton-list-row')).toHaveLength(5)
  })

  it('toggles avatar and action shapes', () => {
    const { container: plain } = render(<SkeletonListRows count={1} showActions={false} />)
    const { container: full } = render(<SkeletonListRows count={1} showAvatar showActions />)
    expect(plain.querySelector('.skeleton-list-row-actions')).toBeNull()
    expect(full.querySelector('.skeleton-list-row-actions')).not.toBeNull()
    expect(full.querySelectorAll('.skeleton-list-row > *').length).toBeGreaterThan(
      plain.querySelectorAll('.skeleton-list-row > *').length,
    )
  })
})

describe('SkeletonFormFields', () => {
  it('renders count field placeholders', () => {
    const { container } = render(<SkeletonFormFields count={6} />)
    expect(container.querySelectorAll('.skeleton-form-field')).toHaveLength(6)
  })

  it('applies a grid-template-columns style when columns > 1', () => {
    const { container } = render(<SkeletonFormFields columns={2} count={2} />)
    const grid = container.querySelector('.skeleton-form-fields') as HTMLElement
    expect(grid.style.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))')
  })
})

describe('SkeletonMetricGrid', () => {
  it('renders count metric card placeholders', () => {
    const { container } = render(<SkeletonMetricGrid count={4} />)
    expect(container.querySelectorAll('.skeleton-metric-card')).toHaveLength(4)
  })
})
