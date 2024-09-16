// Header.tsx
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <>
      <nav className="nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/privacy">Privacy Policy</Link>
          </li>
          <li>
            <Link to="/terms">Terms of Service</Link>
          </li>
        </ul>
      </nav>
      <header className="app-header">
        <div className="app-icon-placeholder">
          <img src="/appicon.jpg" alt="App Icon" />
        </div>
        <h1>Hariku</h1>
        <p>Your mental health companion</p>
      </header>
    </>
  );
};

export default Header;
