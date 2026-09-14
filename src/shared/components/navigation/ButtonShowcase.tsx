import { useState } from 'react'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import { SegmentedButton } from '../ui/SegmentedButton'
import { SplitButton } from '../ui/SplitButton'
import { Fab } from '../ui/Fab'
import { ExtendedFab } from '../ui/ExtendedFab'

export function ButtonShowcase() {
  const [selectedSegment, setSelectedSegment] = useState('list')

  return (
    <div className="m3-button-showcase" data-testid="m3-button-showcase">
      <section className="m3-showcase-section">
        <h3 className="m3-showcase-title">Button Variants (5 M3 Roles)</h3>
        <div className="m3-showcase-grid">
          <Button variant="filled">Filled Button</Button>
          <Button variant="elevated">Elevated Button</Button>
          <Button variant="tonal">Tonal Button</Button>
          <Button variant="outlined">Outlined Button</Button>
          <Button variant="text">Text Button</Button>
          <Button variant="danger">Danger Button</Button>
        </div>
      </section>

      <section className="m3-showcase-section">
        <h3 className="m3-showcase-title">5 Size Tiers (M3 Expressive)</h3>
        <div className="m3-showcase-grid">
          <Button size="xs">Extra Small (xs)</Button>
          <Button size="sm">Small (sm)</Button>
          <Button size="md">Medium (md)</Button>
          <Button size="lg">Large (lg)</Button>
          <Button size="xl">Extra Large (xl)</Button>
        </div>
      </section>

      <section className="m3-showcase-section">
        <h3 className="m3-showcase-title">Interactive States & Icons</h3>
        <div className="m3-showcase-grid">
          <Button icon={<span className="material-symbols-outlined">add</span>}>
            With Icon
          </Button>
          <Button isLoading>Loading State</Button>
          <Button disabled>Disabled State</Button>
        </div>
      </section>

      <section className="m3-showcase-section">
        <h3 className="m3-showcase-title">Icon Buttons</h3>
        <div className="m3-showcase-grid">
          <IconButton icon={<span className="material-symbols-outlined">favorite</span>} variant="filled" aria-label="Favorite filled" />
          <IconButton icon={<span className="material-symbols-outlined">bookmark</span>} variant="tonal" aria-label="Bookmark tonal" />
          <IconButton icon={<span className="material-symbols-outlined">share</span>} variant="outlined" aria-label="Share outlined" />
          <IconButton icon={<span className="material-symbols-outlined">more_vert</span>} variant="standard" aria-label="More options" />
        </div>
      </section>

      <section className="m3-showcase-section">
        <h3 className="m3-showcase-title">Segmented & Split Buttons</h3>
        <div className="m3-showcase-grid">
          <SegmentedButton
            options={[
              { value: 'list', label: 'List' },
              { value: 'grid', label: 'Grid' },
              { value: 'calendar', label: 'Calendar' },
            ]}
            value={selectedSegment}
            onChange={setSelectedSegment}
          />

          <SplitButton>
            Quick Export
          </SplitButton>
        </div>
      </section>

      <section className="m3-showcase-section">
        <h3 className="m3-showcase-title">Floating Action Buttons (FAB)</h3>
        <div className="m3-showcase-grid">
          <Fab icon={<span className="material-symbols-outlined">edit</span>} size="small" aria-label="Small edit FAB" />
          <Fab icon={<span className="material-symbols-outlined">add</span>} size="standard" aria-label="Standard add FAB" />
          <Fab icon={<span className="material-symbols-outlined">done</span>} size="large" aria-label="Large done FAB" />
          <ExtendedFab icon={<span className="material-symbols-outlined">send</span>} label="Send Application" />
        </div>
      </section>
    </div>
  )
}
