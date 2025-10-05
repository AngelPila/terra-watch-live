# load_and_predict.py
import pandas as pd
import numpy as np
import pickle
from math import radians, sin, cos, asin, sqrt
import os

# --- 1. CARGA DE MODELOS Y DATOS ---
# Este bloque se ejecuta UNA SOLA VEZ cuando la API se inicia,
# cargando todo en memoria para que las predicciones sean rápidas.

# Construir rutas relativas al script actual para que funcione en cualquier lugar
script_dir = os.path.dirname(__file__)
MODEL_PATH = os.path.join(script_dir, "modelo_aire_2026.pkl")
CITY_INDEX_PATH = os.path.join(script_dir, "city_index.csv")

try:
    with open(MODEL_PATH, "rb") as f:
        pack = pickle.load(f)
    M0, M1, imp = pack["M0"], pack["M1"], pack["imp_base"]
    BASE_FEATURES, LAG_FEATURES = pack["BASE_FEATURES"], pack["LAG_FEATURES"]

    city_index = pd.read_csv(CITY_INDEX_PATH)
    print("✅ Modelo de predicción y datos de ciudades cargados exitosamente.")

except FileNotFoundError as e:
    print(f"❌ ERROR CRÍTICO: No se pudo encontrar un archivo necesario: {e.filename}")
    print("   Asegúrate de que 'modelo_aire_2026.pkl' y 'city_index.csv' estén en la misma carpeta que este script.")
    # Salir si los archivos no se pueden cargar, ya que la API no puede funcionar
    exit()

# --- 2. FUNCIONES AUXILIARES ---

def _haversine(lon1, lat1, lon2, lat2):
    """
    Calcula la distancia entre dos puntos en la Tierra.
    """
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # CORRECCIÓN DE BUG: La fórmula original tenía un error de copiado (usaba dlat dos veces).
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    return 2 * 6371.0 * asin(sqrt(a)) # Radio de la Tierra en km

def _latest_population_by_coords(lon, lat):
    """
    Encuentra la ciudad más cercana en city_index.csv y devuelve su población.
    """
    dists = city_index.apply(lambda r: _haversine(lon, lat, r["longitude"], r["latitude"]), axis=1)
    row = city_index.loc[dists.idxmin()]
    return float(row["latest_population"])

# --- 3. FUNCIÓN PRINCIPAL DE PREDICCIÓN ---
# Esta es la función que nuestra API de Flask llamará.

def predecir_2026(longitud: float, latitud: float):
    """
    Toma coordenadas y devuelve una predicción de contaminación para 2026.
    """
    pop = _latest_population_by_coords(longitud, latitud)

    # Estimar 2025 con el primer modelo (M0) para generar los 'lags'
    X_prev = pd.DataFrame([{
        "year": 2025,
        "latitude": latitud,
        "longitude": longitud,
        "population": pop
    }])
    X_prev[BASE_FEATURES] = imp.transform(X_prev[BASE_FEATURES])
    seed_pm25, seed_pm10, seed_no2 = M0.predict(X_prev)[0]

    # Predecir 2026 con el segundo modelo (M1) usando los resultados de 2025
    X_cur = pd.DataFrame([{
        "year": 2026,
        "latitude": latitud,
        "longitude": longitud,
        "population": pop,
        "pm25_concentration_lag1": seed_pm25,
        "pm10_concentration_lag1": seed_pm10,
        "no2_concentration_lag1":  seed_no2
    }])
    X_cur[BASE_FEATURES] = imp.transform(X_cur[BASE_FEATURES])
    pm25, pm10, no2 = M1.predict(X_cur[BASE_FEATURES + LAG_FEATURES])[0]
    
    # Devolver un diccionario limpio, que se convertirá fácilmente a JSON
    return {
        "anio": 2026, 
        "pm25": float(pm25), 
        "pm10": float(pm10), 
        "no2": float(no2), 
        "unidades": "µg/m³"
    }

# --- 4. BLOQUE DE EJECUCIÓN DE EJEMPLO ---
# Este código solo se ejecuta si corres "python load_and_predict.py" directamente.
# NO se ejecutará cuando la API de Flask lo importe.
if __name__ == "__main__":
    print("\n--- Ejecutando ejemplo de predicción ---")
    # Coordenadas de ejemplo para Guayaquil, Ecuador
    guayaquil_lon, guayaquil_lat = -79.92, -2.17
    
    print(f"Prediciendo para Longitud: {guayaquil_lon}, Latitud: {guayaquil_lat}")
    prediccion = predecir_2026(longitud=guayaquil_lon, latitud=guayaquil_lat)
    
    print("\nResultado de la predicción:")
    print(prediccion)