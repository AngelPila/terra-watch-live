# prediction_api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import load_and_predict # Importamos tu script original

# Inicializar la aplicación Flask
app = Flask(__name__)
# Habilitar CORS para permitir que tu app React se comunique con esta API
CORS(app)

# Definir la ruta de la API de predicción
@app.route("/predict", methods=["GET"])
def predict():
    # Obtener latitud y longitud de los parámetros de la URL
    lat_str = request.args.get('lat')
    lon_str = request.args.get('lon')

    if not lat_str or not lon_str:
        return jsonify({"error": "Latitud y longitud son requeridas"}), 400
    
    try:
        lat = float(lat_str)
        lon = float(lon_str)
        
        # ¡Llamamos a tu función de predicción original!
        prediction_result = load_and_predict.predecir_2026(longitud=lon, latitud=lat)
        
        # Devolvemos el resultado como JSON
        return jsonify(prediction_result)

    except Exception as e:
        print(f"Error en el modelo de ML: {e}")
        return jsonify({"error": "Ocurrió un error al procesar la predicción."}), 500

# Esto permite ejecutar el servidor con "python app.py"
if __name__ == "__main__":
    # Escucha en todas las IPs en el puerto 5000
    app.run(host="0.0.0.0", port=5000, debug=True)