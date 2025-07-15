from flask import Flask, request, jsonify
from flask_cors import CORS
from chatbot import responder_pregunta, leer_calificaciones, obtener_nombres_completos
import os

app = Flask(__name__)
CORS(app)  # Permitir CORS para todas las rutas y orígenes

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RUTA_CSV = os.path.join(BASE_DIR, 'calificaciones.csv')  # CSV en lugar de XLSX

@app.route('/')
def index():
    return "Servidor del chatbot activo"

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    pregunta = data.get('pregunta')
    respuesta = responder_pregunta(pregunta, ruta_archivo=RUTA_CSV)
    return jsonify({'respuesta': respuesta})

@app.route('/sugerencias', methods=['GET'])
def sugerencias():
    df = leer_calificaciones(RUTA_CSV)
    nombres = obtener_nombres_completos(df)
    materias = df['Materia'].dropna().unique().tolist()  # Cambio aquí
    return jsonify({'nombres': nombres, 'materias': materias})

if __name__ == '__main__':
    app.run(debug=True)
