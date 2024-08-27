import argparse
import json
from PIL import Image
import numpy as np
from pycocotools import mask
import colorsys
import os
import imageio

def process_image(image_path, json_path):
    filename_with_ext = os.path.basename(image_path)
    filename, ext = os.path.splitext(filename_with_ext)

    with open(json_path) as f:
        data = json.load(f)

    image_array = np.array(Image.open(image_path).convert("RGB"))
    rgb_mask = np.zeros((image_array.shape[0], image_array.shape[1], 3))
    os.makedirs(f'{filename}', exist_ok=True)

    for i, item in enumerate(data):
        binary_mask = mask.decode(item['segmentation'])
        rgb_mask[binary_mask == 1] = [int(c * 255) for c in colorsys.hsv_to_rgb((i / len(data)), 1, 1)]
        binary_mask = binary_mask * 255
        imageio.imsave(f'{filename}/mask_{i}.png', binary_mask)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Process an image.')
    parser.add_argument('image_path', type=str, help='The path of the image')
    parser.add_argument('json_path', type=str, help='The path of the COCO segmentation JSON file')

    args = parser.parse_args()

    process_image(args.image_path, args.json_path)