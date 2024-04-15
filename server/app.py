from flask import Flask, request, jsonify
from flask_cors import CORS

from coco_decoder import decode
from segment import process_image

app = Flask(__name__)
CORS(app)

app.route('/masks', methods=['POST'])(decode)

@app.route('/segment', methods=['POST'])
def handle_process_image():
  data = request.get_json()
  image_path = data.get('image_path')
  if not image_path:
    return jsonify({'error': 'Missing image_path'}), 400
  masks = process_image(image_path)
  return jsonify(masks)

if __name__ == '__main__':
    app.run(debug=True)