import React, { useState, useRef } from 'react';
import Canvas from "../components/Canvas";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Editor() {
  const stageRef = useRef();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [jsonData, setJsonData] = useState(null);

  const exportStage = () => {
    const dataUrl = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'stage.png';
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJson = () => {
    if (jsonData) {
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'segmentation.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <Navbar exportStage={exportStage} downloadJson={downloadJson} jsonData={jsonData} />
      <div className="container-fluid min-height">
        <div className="row h-100">
          <div className="col-3">
            <Sidebar setOverlayVisible={setOverlayVisible} overlayVisible={overlayVisible} />
          </div>
          <div className="col-8">
            <Canvas stageRef={stageRef} setOverlayVisible={setOverlayVisible} overlayVisible={overlayVisible} setJsonData={setJsonData} jsonData={jsonData} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Editor;