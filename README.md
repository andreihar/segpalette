<!-- PROJECT LOGO -->
<div align="center">
  <a href="https://github.com/andreihar/segpalette">
	<img src="readme/logo.svg" alt="Logo" width="80" height="80">
  </a>
  
# SegPalette



<!-- PROJECT SHIELDS -->
[![Contributors][contributors-badge]][contributors]
[![Licence][licence-badge]][licence]

**Instance Recolouring by Palette Generation after Instance Segmentation**

A tool for recolouring images by generating segmented instances and applying customised colour palettes to enhance visual appeal.

<div style="position: relative; max-width: 600px;">
  <a href="https://youtu.be/7FBLZdGhSWw">
	<img src="https://img.youtube.com/vi/7FBLZdGhSWw/maxresdefault.jpg" style="width: 100%;">
	<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #FFFFFF99;"></div>
	<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
	  <img src="https://upload.wikimedia.org/wikipedia/commons/4/49/View-playback_Gion_simple.svg" style="width: 75px">
	</div>
  </a>
</div>

</div>



---



<!-- TABLE OF CONTENTS -->
<details open>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#install">Install</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#clone-repository">Clone Repository</a></li>
        <li><a href="#frontend-setup">Frontend Setup</a></li>
        <li><a href="#backend-setup">Backend Setup</a></li>
      </ul>
    </li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

SegPalette is a tool for instance recolouring, employing a novel approach of palette generation post-instance segmentation. It aims to enhance the visual aesthetics of segmented instances by applying customised colour palettes.

### Built With

* [![ReactJS][react-badge]][react]
* [![Flask][flask-badge]][flask]
* [![PyTorch][pytorch-badge]][pytorch]



<!-- INSTALL -->
## Install

### Prerequisites
- Node.js (v14.x or later)
- Python (v3.7 or later)

### Clone Repository
```bash
git clone https://github.com/andreihar/cmpt461.git
cd cmpt461
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

### Backend Setup

Download pre-trained SAM model sam_vit_h_4b8939.pth from [here](https://dl.fbaipublicfiles.com/segment_anything/sam_vit_h_4b8939.pth) and place it in the `server` directory.

Install dependencies and run the server

```bash
cd server
pip install -r requirements.txt
python app.py
```

The website can be accessed through the URL `http://localhost:5173/`.



<!-- MARKDOWN LINKS -->
<!-- Badges and their links -->
[contributors-badge]: https://img.shields.io/github/contributors/andreihar/segpalette?style=for-the-badge&color=44cc11
[contributors]: #contributors
[licence-badge]: https://img.shields.io/github/license/andreihar/segpalette.svg?color=000000&style=for-the-badge
[licence]: LICENSE
[react-badge]: https://img.shields.io/badge/React-087EA4?style=for-the-badge&logo=react&logoColor=ffffff
[react]: https://react.dev/
[flask-badge]: https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white
[flask]: https://flask.palletsprojects.com/
[pytorch-badge]: https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white
[pytorch]: https://pytorch.org/