# prediction_api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import os
from dotenv import load_dotenv
import load_and_predict

# Cargar variables de entorno desde el archivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)

OWM_API_KEY = os.environ.get('OWM_API_KEY')

cache = {}
cache_time = 0
CACHE_DURATION_SECONDS = 600

CAPITAL_CITIES = {
    "USA": (38.89, -77.03), "CAN": (45.42, -75.69), "MEX": (19.43, -99.13),
    "BRA": (-15.79, -47.88), "ARG": (-34.60, -58.38), "COL": (4.71, -74.07),
    "ESP": (40.41, -3.70), "FRA": (48.85, 2.35), "DEU": (52.52, 13.40), "GBR": (51.50, -0.12),
    "RUS": (55.75, 37.61), "CHN": (39.90, 116.40), "JPN": (35.68, 139.69), "IND": (28.61, 77.20),
    "AUS": (-35.28, 149.12), "ZAF": (-25.74, 28.18), "EGY": (30.04, 31.23), "NGA": (9.07, 7.49)
}

@app.route("/global-aqi", methods=["GET"])
def get_global_aqi():
    global cache, cache_time
    if time.time() - cache_time < CACHE_DURATION_SECONDS:
        return jsonify(cache)
    print("Refrescando caché de datos globales de AQI...")
    new_data = {}
    for iso, coords in CAPITAL_CITIES.items():
        lat, lon = coords
        url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={OWM_API_KEY}"
        try:
            response = requests.get(url).json()
            aqi = response['list'][0]['main']['aqi']
            new_data[iso] = {"aqi": aqi}
        except Exception as e:
            print(f"No se pudieron obtener datos para {iso}: {e}")
    cache = new_data
    cache_time = time.time()
    return jsonify(cache)

@app.route("/predict", methods=["GET"])
def predict():
    lat_str = request.args.get('lat')
    lon_str = request.args.get('lon')
    if not lat_str or not lon_str:
        return jsonify({"error": "Latitud y longitud son requeridas"}), 400
    try:
        lat, lon = float(lat_str), float(lon_str)
        prediction_result = load_and_predict.predecir_2026(longitud=lon, latitud=lat)
        return jsonify(prediction_result)
    except Exception as e:
        return jsonify({"error": "Ocurrió un error al procesar la predicción."}), 500

if __name__ == "__main__":
    if not OWM_API_KEY:
        print("❌ ERROR: La variable de entorno 'OWM_API_KEY' no está configurada.")
    else:
        app.run(host="0.0.0.0", port=5000)