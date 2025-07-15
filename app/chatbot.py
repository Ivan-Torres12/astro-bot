import os
import pandas as pd

# Leer archivo CSV de calificaciones
def leer_calificaciones(ruta_archivo):
    df = pd.read_csv(ruta_archivo, encoding='latin1')  # o 'windows-1252'
    df.columns = df.columns.str.strip()
    return df


# Obtener lista de nombres completos para autocompletar
def obtener_nombres_completos(df):
    nombres_completos = []
    for _, row in df.iterrows():
        nombre = str(row['Nombre']).strip()
        paterno = str(row['Paterno']).strip()
        materno = str(row['Materno']).strip()
        nombres_completos.append(f"{nombre} {paterno} {materno}")
    return sorted(list(set(nombres_completos)))

# Procesar la pregunta buscando nombre completo y materia
def procesar_pregunta(pregunta, df):
    pregunta = pregunta.lower().strip()

    columnas_necesarias = [
        'Nombre', 'Paterno', 'Materno',
        'Materia', 'Calificacion',
        'Profesor', 'Cuatrimestre'
    ]
    for col in columnas_necesarias:
        if col not in df.columns:
            return f"⚠️ El archivo debe tener la columna '{col}'."

    nombre_completo = None
    for _, row in df.iterrows():
        nombre = str(row['Nombre']).strip()
        paterno = str(row['Paterno']).strip()
        materno = str(row['Materno']).strip()
        completo = f"{nombre} {paterno} {materno}".lower()

        if completo in pregunta:
            nombre_completo = (nombre, paterno, materno)
            break

    materia = None
    mejor_match = ""
    for mat in df['Materia'].dropna().unique():
        mat_normalizado = str(mat).strip().lower()
        if mat_normalizado in pregunta:
            if len(mat_normalizado) > len(mejor_match):
                mejor_match = mat_normalizado
                materia = mat

    if nombre_completo and materia:
        return obtener_calificacion(df, nombre_completo, materia)
    else:
        return ("Lo siento, no entendí tu pregunta. "
                "Por favor, asegúrate de incluir el nombre completo del alumno y la materia exacta.")

# Obtener la calificación del alumno en una materia específica
def obtener_calificacion(df, nombre_completo, materia):
    nombre, paterno, materno = nombre_completo

    fila = df[
        (df['Nombre'].str.strip() == nombre) &
        (df['Paterno'].str.strip() == paterno) &
        (df['Materno'].str.strip() == materno) &
        (df['Materia'].str.strip() == materia)
    ]

    if fila.empty:
        return f"No encontré calificación para {nombre} {paterno} {materno} en {materia}."

    calificacion = fila.iloc[0]['Calificacion']
    profesor = str(fila.iloc[0]['Profesor']).strip()
    cuatrimestre = fila.iloc[0]['Cuatrimestre']

    # Detección de género del profesor
    genero = "profesor"
    profesor_lower = profesor.lower()
    if any(pref in profesor_lower for pref in ['mtra', 'dra', 'profra', 'lic.']) or profesor_lower.split()[0].endswith('a'):
        genero = "profesora"

    # Validar si la calificación es numérica o "NC"
    try:
        calificacion_float = float(calificacion)
        estado = "Aprobado" if calificacion_float > 5 else "Reprobado"
    except:
        if str(calificacion).strip().upper() == "NC":
            estado = "Reprobado"
        else:
            return f"La calificación '{calificacion}' no es válida para {nombre} {paterno} {materno} en {materia}."

    return (
        f"{nombre} {paterno} {materno} obtuvo '{calificacion}' en la materia '{materia}'.\n"
        f"{genero.capitalize()}: {profesor} | Cuatrimestre: {cuatrimestre} | Estado: {estado}."
    )

# Función principal del chatbot
def responder_pregunta(pregunta, ruta_archivo='calificaciones.csv'):
    ruta_base = os.path.dirname(__file__)
    ruta_completa = os.path.join(ruta_base, ruta_archivo)

    if not os.path.exists(ruta_completa):
        return f"⚠️ El archivo '{ruta_archivo}' no se encontró en la carpeta del proyecto."

    df = leer_calificaciones(ruta_completa)
    return procesar_pregunta(pregunta, df)
