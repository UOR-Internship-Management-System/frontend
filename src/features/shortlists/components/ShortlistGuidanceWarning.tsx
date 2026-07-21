import type { Shortlist } from '../types/shortlistTypes'

export function ShortlistGuidanceWarning({ shortlist }: { shortlist: Shortlist }) {
  const guidanceProvided = shortlist.guidanceValue !== null
  const title = !guidanceProvided
    ? 'Guidance not provided'
    : shortlist.guidanceExceeded
      ? 'Guidance exceeded'
      : 'Within guidance'

  return (
    <section
      aria-labelledby="shortlist-guidance-title"
      className={`shortlist-guidance-warning ${
        shortlist.guidanceExceeded ? 'is-exceeded' : 'is-within'
      }`.trim()}
      role="status"
    >
      <div className="shortlist-guidance-heading">
        <div>
          <p className="shortlist-guidance-eyebrow">Advisory guidance</p>
          <h3 id="shortlist-guidance-title">{title}</h3>
        </div>
        <dl className="shortlist-guidance-counts">
          <div>
            <dt>Selected</dt>
            <dd>{shortlist.selectedCandidateCount}</dd>
          </div>
          <div>
            <dt>Guidance</dt>
            <dd>{shortlist.guidanceValue ?? 'Not provided'}</dd>
          </div>
        </dl>
      </div>

      <p>
        {shortlist.guidanceExceeded
          ? shortlist.guidanceWarning ||
            'The selected candidate count is above the request guidance value.'
          : guidanceProvided
            ? 'The selected candidate count does not exceed the request guidance value.'
            : 'This internship request does not define a shortlist guidance value.'}
      </p>

      <p className="shortlist-guidance-note">
        Guidance is advisory. It does not automatically add, remove, approve, reject, or rank
        candidates.
      </p>
    </section>
  )
}
