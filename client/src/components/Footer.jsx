import sfuLogo from '../assets/sfu-logo.png'

function Footer() {
  return (
    <div className="footer bg-light">
      <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 border-top px-2">
        <div className="col-md-4 d-flex align-items-center">
          <span className="mb-3 mb-md-0 text-body-secondary">
            © 2024 Company, Inc
          </span>
        </div>
        <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
          <li className="ms-3">
            <a className="text-body-secondary" href="#">
              <img src={sfuLogo} height={24} alt="SFU Logo" />
            </a>
          </li>
        </ul>
      </footer>
    </div>
  )
}

export default Footer