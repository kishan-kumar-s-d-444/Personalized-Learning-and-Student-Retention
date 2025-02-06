# python -m venv env
# env\Scripts\activate


from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Load your model
with open("models/dropout_model.pkl", "rb") as file:
    model = joblib.load(file)
    logging.debug(f"Model loaded: {model}")

# Ensure model has a predict method
if not hasattr(model, 'predict'):
    raise TypeError("Loaded model does not have a 'predict' method")

# Define the predict route
@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Parse the JSON data sent in the request
        data = request.get_json()
        logging.debug(f"Received data: {data}")

        features = np.array(data["features"]).reshape(1, -1)
        logging.debug(f"Features reshaped for prediction: {features}")

        # Make a prediction
        prediction = model.predict(features)
        logging.debug(f"Prediction: {prediction}")

        return jsonify({"prediction": prediction[0]})
    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
