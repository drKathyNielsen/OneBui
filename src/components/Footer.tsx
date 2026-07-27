interface Props {
  onAbout: () => void;
}

export default function Footer({ onAbout }: Props) {
  return (
    <footer className="oneb-footer">
      <span>&copy; 2026 One B</span>
      <span className="oneb-footer-sep" aria-hidden="true">·</span>
      <button type="button" className="oneb-link-btn" onClick={onAbout}>About</button>
    </footer>
  );
}
