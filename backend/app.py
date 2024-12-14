from flask import Flask, jsonify
from flask_cors import CORS
from flask_cors import cross_origin
import pandas as pd
import json
import os

# Importa los Blueprints
from indexPR import indexPR_blueprint
from mapsRT import mapsRT_blueprint

# [A] Inicializa la aplicación + configuracion de CORS -----------------
app = Flask(__name__)
CORS(app)

# Registra Blueprints con `url_prefix`
app.register_blueprint(indexPR_blueprint, url_prefix='/indexPR')
app.register_blueprint(mapsRT_blueprint, url_prefix='/mapsRT')

# [B] Define rutas de archivo como variables -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SPHI_FILE_PATH = os.path.join(BASE_DIR, 'upc_tmp', 'sphi.tmp')
ROTI_FILE_PATH = os.path.join(BASE_DIR, 'upc_tmp', 'roti.tmp')
NETWORK_STATIONS_PATH = os.path.join(BASE_DIR, 'static', 'networkStations.json')
# PNG_FILE_PATH = os.path.join(BASE_DIR, 'rtMaps', 'mapBack.png')

# [C] Endpoint para obtener estaciones de la red -------------------------------
@app.route('/api/network-stations', methods=['GET'])
@cross_origin(origins="http://localhost:8123")
def get_network_stations():
    with open(NETWORK_STATIONS_PATH, 'r') as file:
        data = json.load(file)
    return jsonify(data)

# [E] Endpoint para leer el archivo sphi.tmp y devolverlo como JSON ------------
@app.route('/api/read-sphi', methods=['GET'])
def read_sphi():
    try:
        data = pd.read_csv(SPHI_FILE_PATH, sep=r'\s+', header=None)
        data_json = data.to_json(orient='records')
        return jsonify(json.loads(data_json))
    except FileNotFoundError:
        return jsonify({"error": "El archivo sphi.tmp no se encuentra"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# [F] Endpoint para leer el archivo roti.tmp y devolverlo como JSON -----------
@app.route('/api/read-roti', methods=['GET'])
def read_roti():
    try:
        data = pd.read_csv(ROTI_FILE_PATH, sep=r'\s+', header=None)
        data_json = data.to_json(orient='records')
        return jsonify(json.loads(data_json))
    except FileNotFoundError:
        return jsonify({"error": "El archivo roti.tmp no se encuentra"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# [Z] Ejecuta la aplicación --------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True)
