import sfuLogo from '../assets/sfu-logo.png';
import compPhotLab from '../assets/logo-long.png';

function Footer() {
  return (
    <div className="">
      <footer className="footer d-flex flex-wrap justify-content-between align-items-center px-5 bg-primary">
        <div className="col-md-4 d-flex align-items-center">
        </div>
        <div className="col-md-4 d-flex justify-content-end align-items-center">
          <a className="text-body-secondary ms-3" href="#">
            <img src={compPhotLab} className="px-2" height={24} alt="Computational Photography Lab Logo" />
            <img src={sfuLogo} height={28} alt="SFU Logo" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Footer;