import cv2
import numpy as np
import base64
import h5py
from tensorflow.keras.models import load_model
from tensorflow.keras.initializers import Orthogonal
import mediapipe as mp

actions = np.array(['السلام عليكم','الحمد لله', 'كيف الحال'])

def remove_time_major(file_path):
    with h5py.File(file_path, 'r+') as f:
        model_config = f.attrs.get('model_config')
        if model_config:
            import json
            config = json.loads(model_config)
            for layer in config['config']['layers']:
                if 'time_major' in layer['config']:
                    del layer['config']['time_major']
            f.attrs['model_config'] = json.dumps(config).encode('utf-8')

# Path to your model
model_path = 'application/static/model/action.h5'

# Remove the time_major attribute
remove_time_major(model_path)

# Load the model
model = load_model(model_path, custom_objects={'Orthogonal': Orthogonal})

#model = load_model('application/static/model/action.h5')
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = model.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    return image, results

def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]).flatten() if results.face_landmarks else np.zeros(468*3)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, face, lh, rh])

def predict(data):
    image_data = base64.b64decode(data['image'])
    np_image = np.fromstring(image_data, np.uint8)
    frame = cv2.imdecode(np_image, cv2.IMREAD_COLOR)

    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        _, results = mediapipe_detection(frame, holistic)
        keypoints = extract_keypoints(results)
        sequence = [keypoints] * 30  # Dummy sequence for prediction

        res = model.predict(np.expand_dims(sequence, axis=0))[0]
        action = actions[np.argmax(res)]
        return action