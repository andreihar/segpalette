import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import Canvas from "../components/Canvas";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Editor() {
  const stageRef = useRef();
  const jsonData = useSelector(state => state.editor.jsonData);
  const [loadMachuPicchu, setLoadMachuPicchu] = useState(null);

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
      <Navbar exportStage={exportStage} downloadJson={downloadJson} loadMachuPicchu={loadMachuPicchu} />
      <div className="container-fluid min-height">
        <div className="row h-100">
          <div className="col-3">
            <Sidebar />
          </div>
          <div className="col-9 min-height" style={{ overflow: 'auto' }}>
            <Canvas stageRef={stageRef} setLoadMachuPicchu={setLoadMachuPicchu} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Editor;