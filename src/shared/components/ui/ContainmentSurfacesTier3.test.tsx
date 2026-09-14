import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  Carousel,
  CarouselItem,
} from './index'

describe('Tier 3: Containment, Structure & Surfaces', () => {
  describe('Card', () => {
    it('renders with default outlined variant and preserves legacy .card class', () => {
      render(<Card>Card Content</Card>)
      const card = screen.getByText('Card Content')
      expect(card).toHaveClass('card')
      expect(card).toHaveClass('m3-card')
      expect(card).toHaveClass('m3-card--outlined')
    })

    it('supports elevated, filled, and surface container levels', () => {
      const { rerender } = render(
        <Card variant="elevated" surface="low">
          Elevated Card
        </Card>,
      )
      const card = screen.getByText('Elevated Card')
      expect(card).toHaveClass('m3-card--elevated')
      expect(card).toHaveClass('m3-card--surface-low')

      rerender(
        <Card variant="filled" surface="highest">
          Filled Card
        </Card>,
      )
      expect(card).toHaveClass('m3-card--filled')
      expect(card).toHaveClass('m3-card--surface-highest')
    })

    it('supports interactive lift & bloom state', () => {
      render(<Card interactive>Interactive Card</Card>)
      expect(screen.getByText('Interactive Card')).toHaveClass('m3-card--interactive')
    })

    it('renders compound sub-components: Header, Title, Subtitle, Content, Actions', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Academic Ledger</CardTitle>
            <CardSubtitle>Batch Review</CardSubtitle>
          </CardHeader>
          <CardContent>Validating rows...</CardContent>
          <CardActions>
            <button type="button">Commit</button>
          </CardActions>
        </Card>,
      )

      expect(screen.getByRole('heading', { name: 'Academic Ledger' })).toBeInTheDocument()
      expect(screen.getByText('Batch Review')).toBeInTheDocument()
      expect(screen.getByText('Validating rows...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Commit' })).toBeInTheDocument()
    })
  })

  describe('Divider', () => {
    it('renders horizontal divider by default and supports vertical orientation', () => {
      const { rerender } = render(<Divider data-testid="divider" />)
      const divider = screen.getByTestId('divider')
      expect(divider).toHaveClass('m3-divider')
      expect(divider).toHaveAttribute('aria-orientation', 'horizontal')

      rerender(<Divider data-testid="divider" vertical inset="both" />)
      expect(divider).toHaveClass('m3-divider--vertical')
      expect(divider).toHaveClass('m3-divider--inset-both')
      expect(divider).toHaveAttribute('aria-orientation', 'vertical')
    })
  })

  describe('List and ListItem', () => {
    it('renders list with headline, supporting text, leading and trailing elements', () => {
      render(
        <List>
          <ListItem
            headline="CS401 Internship Preparation"
            supportingText="Faculty of Science · 4 Credits"
            leading={<span data-testid="leading-icon">📚</span>}
            trailing={<span data-testid="trailing-badge">Active</span>}
            interactive
          />
        </List>,
      )

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getByText('CS401 Internship Preparation')).toBeInTheDocument()
      expect(screen.getByText('Faculty of Science · 4 Credits')).toBeInTheDocument()
      expect(screen.getByTestId('leading-icon')).toBeInTheDocument()
      expect(screen.getByTestId('trailing-badge')).toBeInTheDocument()
      expect(screen.getByRole('listitem')).toHaveClass('m3-list-item--interactive')
    })
  })

  describe('Carousel', () => {
    it('renders carousel with proper ARIA roles and controls', async () => {
      render(
        <Carousel ariaLabel="Featured Projects">
          <CarouselItem width={280}>Project 1</CarouselItem>
          <CarouselItem width={280}>Project 2</CarouselItem>
        </Carousel>,
      )

      const carousel = screen.getByRole('region', { name: 'Featured Projects' })
      expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')

      const slides = screen.getAllByRole('group', { name: '' })
      expect(slides).toHaveLength(2)

      const prevBtn = screen.getByRole('button', { name: 'Previous items' })
      const nextBtn = screen.getByRole('button', { name: 'Next items' })
      expect(prevBtn).toBeInTheDocument()
      expect(nextBtn).toBeInTheDocument()

      await userEvent.click(nextBtn)
      await userEvent.click(prevBtn)
    })
  })
})
