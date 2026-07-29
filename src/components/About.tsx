// Static "about" view: the product story, framed for readers of the webpage.
// This is the home view — rendered in the shell's content column beside the
// city sidebar (masthead-styled to match the editorial identity). Delivery/email
// specifics are intentionally omitted — this describes what you can read today.
// Pick a city from the sidebar to leave home; there's no in-page back link.
export default function About() {
  return (
    <div className="oneb-digest">
      <header className="oneb-masthead">
        <p className="oneb-kicker">ABOUT</p>
        <h1 className="oneb-city-name">One B</h1>
        <p className="oneb-date">THE LOCAL PAGE, FOR EVERY PERSON YOU CARE ABOUT</p>
      </header>

      <div className="oneb-about">
        <p className="oneb-about-lede">
          Know what's happening where your people are, <i>before</i> you get in a meeting.
        </p>

        <section className="oneb-about-section">
          <h2 className="oneb-section-heading">Local, where it counts</h2>
          <p>
            You work with people across many cities. One B gives you the local page for
            each one. Currated news and sports highlighting what really matters, distilled
            to a quick read. Not a firehose. The good stuff.
          </p>
        </section>

        <section className="oneb-about-section">
          <h2 className="oneb-section-heading">Show up in the know</h2>
          <p>
            The best way to close distance is to notice. Ask about the storm that hit
            Columbus, or congratulate them on their team's big win. It lands because it's specific — and now
            it's effortless, because it comes to you.
          </p>
        </section>

        <section className="oneb-about-section">
          <h2 className="oneb-section-heading">The 1B bar</h2>
          <p>
            "1B" is the local page in the paper; One B is the <i>most relevent</i> local stories. That's
            our whole standard. Every item clears the bar for local significance, or it
            doesn't run. What you get is worth knowing, and worth saying.
          </p>
        </section>

        <section className="oneb-about-section">
          <h2 className="oneb-section-heading">Nothing you don't need</h2>
          <p>
            No endless feed. No follow-for-follow. No pinging anyone else. Just the cities
            you choose, today's brief and the week in review, kept short on purpose.
          </p>
        </section>
      </div>
    </div>
  );
}
