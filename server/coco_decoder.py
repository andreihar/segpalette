from flask import request, jsonify
import numpy as np
from pycocotools import mask
import base64
import cv2

def decode():
  data = request.get_json()
  binary_masks = []
  for i, item in enumerate(data):
    binary_mask = mask.decode(item['segmentation'])
    binary_mask = (binary_mask * 255).astype(np.uint8)
    _, encoded_image = cv2.imencode('.png', binary_mask)
    base64_image = base64.b64encode(encoded_image).decode('utf-8')
    binary_masks.append(base64_image)
  return jsonify(binary_masks)