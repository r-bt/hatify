import flask
import functions_framework
import pickle
from io import BytesIO
import urllib.request

# for loading/processing the images  
from tensorflow.keras.utils import load_img, img_to_array
from keras.applications.vgg16 import preprocess_input 

# models 
from tensorflow import keras
from keras.applications.vgg16 import VGG16 
from keras.models import Model

import numpy as np

from sklearn.decomposition import PCA

# Load some pickles
urllib.request.urlretrieve("https://github.com/r-bt/hatify/blob/main/all_features.pkl?raw=true", "/tmp/all_features.pkl")
all_features_file = open("/tmp/all_features.pkl",'rb')
all_features = pickle.load(all_features_file)

print("All features!")

urllib.request.urlretrieve("https://github.com/r-bt/hatify/blob/main/kmeans.pkl?raw=true", "/tmp/kmeans.pkl")
kmeans_file = open("/tmp/kmeans.pkl",'rb')
kmeans = pickle.load(kmeans_file)

print("KMeans!")

ALLOWED_EXTENSIONS = {'png'}

def extract_features(file, model):
  img = load_img(file, target_size=(224,224))
  img = np.array(img)
  reshaped_img = img.reshape(1,224,224,3) 
  imgx = preprocess_input(reshaped_img)
  features = model.predict(imgx, use_multiprocessing=True)
  return features

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@functions_framework.http
def predict(request):
  if request.method == 'OPTIONS':
    # Allows GET requests from any origin with the Content-Type
    # header and caches preflight response for an 3600s
    headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    }

    return ('', 204, headers)
  # Set CORS headers for the main request
  headers = {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Origin': '*'
  }
  if request.method != 'POST':
    return 'Invalid method'
  # Get image
  try:
    file = request.files['file']
    if not allowed_file(file.filename):
      return "Invalid file type"
    model = VGG16()
    # remove the output layer
    model = Model(inputs=model.inputs, outputs=model.layers[-2].output)
    image_bytes = BytesIO(file.read())
    # Get and transform features
    features = extract_features(image_bytes, model)
    # Add new image to pickled features
    extended_features = np.concatenate((all_features, features), 0)
    #reduce feature list dimension
    pca = PCA(n_components=100, random_state=22) 
    pca.fit(extended_features)
    reduced_image_features = pca.transform(features)
    # Clusters
    cluster = kmeans.predict(reduced_image_features)
    return (str(cluster[0]), 200, headers)
  except Exception as e:
    print("Error")
    print(e)
    return ("No image sent!", 400, headers)
  # Setup model
 

