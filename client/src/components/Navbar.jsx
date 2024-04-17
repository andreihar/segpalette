import LogoLong from "../assets/png/logo-long.png";
import SFULogo from "../assets/png/sfu-logo.png";
import { useSelector } from 'react-redux';

function Navbar({ exportStage, downloadJson }) {
  const jsonData = useSelector(state => state.editor.jsonData);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="container">
        <a className="navbar-brand" href="#">
          Container
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbars" aria-controls="navbars" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbars">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">
                Files
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#" onClick={exportStage}>Export Image</a>
                </li>
                { jsonData && (
                <li>
                  <a className="dropdown-item" href="#" onClick={downloadJson}>Export Segmentation</a>
                </li>
                )}
                <hr />
                <li>
                  <a className="dropdown-item" href="#">Load Sample Image</a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                About
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;