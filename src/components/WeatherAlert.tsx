import type { Alert } from '../types';

// Active weather alerts for the metro. Rendered above "Are they ok?" only when
// there's at least one alert — a conditional status banner, not an always-on
// section. Alerts are significance-filtered upstream; array order is kept.
export default function WeatherAlert({ alerts, heading }: { alerts: Alert[]; heading: string }) {
  return (
    <section className="oneb-alert-box" role="region" aria-labelledby="heading-weather">
      <h2 className="oneb-section-heading oneb-section-heading--plain" id="heading-weather"><span className="oneb-section-heading-badge">{heading}</span></h2>
      <ul className="oneb-alert-list list-unstyled">
        {alerts.map((a, i) => (
          <li className="oneb-alert" key={`${a.event}-${a.area ?? ''}-${i}`}>
            <span className="oneb-alert-event">{a.event}</span>
            <span className="oneb-alert-detail">
              {a.area}
              {a.area && a.endsLabel && ' · '}
              {a.endsLabel}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
