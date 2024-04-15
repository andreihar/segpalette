import React, { useState, useRef } from 'react';
import Canvas from "../components/Canvas";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Editor() {
  const stageRef = useRef();
  const [overlayVisible, setOverlayVisible] = useState(false);

  const exportStage = () => {
    const dataUrl = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'stage.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Navbar exportStage={exportStage} />
      <div className="container-fluid min-height">
        <div className="row h-100">
          <div className="col-3">
            <Sidebar setOverlayVisible={setOverlayVisible} overlayVisible={overlayVisible} />
          </div>
          <div className="col-8">
            <Canvas stageRef={stageRef} setOverlayVisible={setOverlayVisible} overlayVisible={overlayVisible} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Editor;