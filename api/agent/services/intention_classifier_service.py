from agent.providers.text_generation.text_generator_manager import (
    text_generator_manager,
)

class IntentionClassifierService:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(IntentionClassifierService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.text_generator_manager = text_generator_manager
            self._initialized = True

    def get_intent_prompt(self, user_input):
        """Genera el prompt para clasificar la intención del usuario"""
        return f"""
    Eres un asistente que clasifica intenciones para chat simple con imágenes.

    Clasifica la siguiente consulta del usuario en una de estas categorías:

    - TEST: cuando el usuario quiere ejecutar un test o simplemente dice "test"
    - GENERAL_QUERY: Otras consultas generales

    Reglas de prioridad (en orden de importancia):
    1. Si la consulta menciona "test", "ejecuta test", "testing" → TEST
    2. Cualquier otra consulta → GENERAL_QUERY

    Ejemplos:
    - "Ejecuta un test" → TEST
    - "Qué es Python?" → GENERAL_QUERY

    Consulta del usuario: "{user_input}"

    Responde SOLO con una de las categorías.
    No respondas nada más, solo la categoría exacta sin explicaciones.
    """

    def classify_intention(self, user_input):
        """Método para compatibilidad con ChatbotNodes"""
        return self.execute(user_input)

    def execute(self, user_input):
        try:

            # Generar el prompt
            prompt = self.get_intent_prompt(user_input)

            # Generar respuesta
            response = self.text_generator_manager.execute_generator("gemini", prompt)

            # Extraer y limpiar la respuesta
            intent = response.strip().upper()

            return intent

        except Exception as e:
            print(f"❌ Error al clasificar intención: {e}")
            return "GENERAL_QUERY"  # Categoría por defecto
