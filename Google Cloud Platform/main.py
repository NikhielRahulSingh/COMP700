import tensorflow as tf
import numpy as np
import cv2
from google.cloud import storage
from io import BytesIO
from tensorflow.keras.preprocessing import image
from PIL import Image

model = None
interpreter = None
input_index = None
output_index = None

class_names = ["Normal", "Psoriasis"]

BUCKET_NAME = "220013139_models" 


def download_blob(bucket_name, source_blob_name, destination_file_name):
    """Downloads a blob from the bucket."""
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(source_blob_name)

    blob.download_to_filename(destination_file_name)

    print(f"Blob {source_blob_name} downloaded to {destination_file_name}.")

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

def predict(request):
    global model
    if model is None:
        download_blob(BUCKET_NAME,"models/cnn.h5","/tmp/cnn.h5",)
        model = tf.keras.models.load_model("/tmp/cnn.h5")

    image_file_storage = request.files["file"] # werkzeug.datastructures.file_storage.FileStorage
    _ = Image.open(image_file_storage) # PIL.JpegImagePlugin.JpegImageFile
    _.save("/tmp/output.jpeg")

    from tensorflow.keras.preprocessing import image
    _ = image.load_img('/tmp/output.jpeg', target_size=(256, 256))
    img = np.expand_dims(_, 0)
    img = img / 255.0

    preds = model.predict(img)
    predicted_classes = (preds > 0.5).astype(int)  # For classification

    confidence=preds[0][0]*100
    if preds<0.5 : confidence = 1-preds[0][0]*100

    pred_class = class_names[predicted_classes[0][0]]
    return {"Class": str(pred_class),
            "Confidence" : round(confidence,2)
            }