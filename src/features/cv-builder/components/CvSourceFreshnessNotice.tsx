import type { CvFreshnessView } from '../types/cvBuilderTypes'

export function CvSourceFreshnessNotice({ freshness }: { freshness: CvFreshnessView }) {
  return (
    <section
      aria-labelledby="cv-freshness-title"
      className={`s5-cv-freshness s5-cv-freshness-${freshness.tone}`}
      role={freshness.status === 'OUTDATED' ? 'alert' : 'status'}
    >
      <span aria-hidden="true" className="material-symbols-outlined">
        {freshness.status === 'CURRENT'
          ? 'check_circle'
          : freshness.status === 'OUTDATED'
            ? 'warning'
            : 'info'}
      </span>
      <div>
        <h2 id="cv-freshness-title">{freshness.title}</h2>
        <p>{freshness.message}</p>
        {freshness.changedAreaLabels.length ? (
          <p>
            Changed areas: <strong>{freshness.changedAreaLabels.join(', ')}</strong>
          </p>
        ) : null}
        {freshness.savedAtLabel ? <small>Last saved {freshness.savedAtLabel}</small> : null}
      </div>
    </section>
  )
}
