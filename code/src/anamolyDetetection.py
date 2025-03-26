import pandas as pd
import numpy as np
from tensorflow import keras
from sklearn.preprocessing import MinMaxScaler
from statsmodels.tsa.arima.model import ARIMA
import sys
import json

def detect_anomalies(csv_file_path, model_path):
    # ... (your anomaly detection logic from the previous examples) ...
    try:
        model = keras.models.load_model(model_path, custom_objects={'mse': 'mse'})
        data = pd.read_csv(csv_file_path)
        # ... (rest of your anomaly detection code) ...
        return data.to_csv(index=False)
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    csv_file_path = sys.argv[1]
    model_path = sys.argv[2]
    csv_data = detect_anomalies(csv_file_path, model_path)
    print(json.dumps({"csvData": csv_data}))