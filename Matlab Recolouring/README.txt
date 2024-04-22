Here is a link to a video describing how to use the recolouring scripts: https://youtu.be/3s16IgF_vp0

You can generate the binary masks from a segmentation using the decode_rle.py script from the command line with the following command:

python decode_rle.py SOURCE_IMAGE.jpg SEGMENTATION_FILE.json

You may need to install pycocotools for the script to run:
For Windows:
pip install pycocotools-windows
Otherwise:
pip install pycocotools

Once you have the binary masks, load palette_demo.m and follow the comments
