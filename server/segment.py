import cv2
from segment_anything import SamAutomaticMaskGenerator, sam_model_registry
import os

def process_image(image_path: str) -> dict:
    print("Loading model...")
    sam = sam_model_registry['vit_h'](checkpoint='sam_vit_h_4b8939.pth')
    _ = sam.to(device='cpu')
    output_mode = "coco_rle"
    generator = SamAutomaticMaskGenerator(sam, output_mode=output_mode)

    print(f"Processing '{image_path}'...")
    image = cv2.imread(image_path)
    if image is None:
        print(f"Could not load '{image_path}' as an image, skipping...")
        return {}
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    masks = generator.generate(image)

    print("Done!")
    return masks