interface Props {
  onBack: () => void;
}

// Static "about" view: the product story, framed for readers of the webpage.
// Reachable at ?view=about; rendered in place of the digest (masthead-styled to
// match the editorial identity). Delivery/email specifics are intentionally
// omitted — this describes what you can read here today.
export default function About({ onBack }: Props) {
  return (
    <div className="oneb-shell">
      <header className="oneb-masthead">
        <p className="oneb-kicker">ABOUT</p>
        <h1 className="oneb-city-name">One B</h1>
        <p className="oneb-date">THE LOCAL PAGE, FOR EVERY CITY YOU CARE ABOUT</p>
      </header>

      <div className="oneb-about">
        <p className="oneb-about-lede">
          Know what's happening where your people are — before you pick up the phone.
        </p>

        <section className="oneb-about-section">
          <h2 className="oneb-section-heading">Local, where it counts</h2>
          <p>
            You work with people across a dozen cities. One B gives you the local page for
            each one — the news and sports that actually matter there this week, distilled
            to a quick read. Not a firehose. The good stuff.
          </p>
        </section>

        <section className="oneb-about-section">
          <h2 className="oneb-section-heading">Show up in the know</h2>
          <p>
            The best way to close distance is to notice. Ask about the storm that hit
            Columbus, or how the home team did. It lands because it's specific — and now
            it's effortless, because you already read it this morning.
          </p>
        </section>

        <section className="oneb-about-section">
          <h2 className="oneb-section-heading">The 1B bar</h2>
          <p>
            "1B" is the local page in the paper — where a story has to earn its place. That's
            our whole standard. Every item clears the bar for local significance, or it
            doesn't run. What's left is worth knowing, and worth saying.
          </p>
        </section>

        <section className="oneb-about-section">
          <h2 className="oneb-section-heading">Nothing you don't need</h2>
          <p>
            No endless feed. No follow-for-follow. No pinging anyone else. Just the cities
            you choose, today's brief and the week in review, kept short on purpose.
          </p>
        </section>

        <p className="oneb-about-back">
          <button type="button" className="oneb-link-btn" onClick={onBack}>
            ← Back to the digest
          </button>
        </p>
      </div>
    </div>
  );
}
