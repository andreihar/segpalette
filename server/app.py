from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os

from coco_decoder import decode
from segment import process_image

app = Flask(__name__)
CORS(app)

app.route('/masks', methods=['POST'])(decode)

@app.route('/segment', methods=['POST'])
def handle_process_image():
  if 'image' not in request.files:
    return jsonify({'error': 'No image file'}), 400

  file = request.files['image']
  filename = secure_filename(file.filename)
  filepath = os.path.join(os.getcwd(), filename)
  file.save(filepath)

  masks = process_image(filepath)
  return jsonify(masks)

if __name__ == '__main__':
    app.run(debug=True)