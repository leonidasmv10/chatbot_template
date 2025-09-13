"""
Configuración del agente de chat simple.
Define configuraciones, constantes y parámetros del sistema.
"""

import os
from typing import List

# Configuración de logging
LOGGING_CONFIG = {
    'level': 'INFO',
    'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
}

# Configuración del workflow
WORKFLOW_CONFIG = {
    'max_execution_time': 30,  # Tiempo máximo de ejecución en segundos
    'retry_attempts': 3,       # Número de intentos de reintento
    'cleanup_temp_files': True # Limpiar archivos temporales
}

# Mensajes del sistema
SYSTEM_MESSAGES = {
    'startup': 'Iniciando el sistema de chat simple.',
    'success': 'Respuesta generada exitosamente.',
    'error': 'Error en el procesamiento del chat.',
    'no_input': 'No se recibió mensaje para procesar.',
    'workflow_unavailable': 'Sistema de chat no disponible.'
}

# Configuración de respuesta
RESPONSE_CONFIG = {
    'include_messages': True,      # Incluir mensajes del sistema en la respuesta
    'max_response_length': 1000  # Longitud máxima de respuesta
}

# Configuración de rutas
PATHS = {
    'temp': 'temp'
}

def get_temp_folder() -> str:
    """Obtiene la ruta de la carpeta temporal."""
    return os.path.join(os.getcwd(), PATHS['temp'])

def create_directories():
    """Crea las carpetas necesarias si no existen."""
    if not os.path.exists(get_temp_folder()):
        os.makedirs(get_temp_folder(), exist_ok=True)