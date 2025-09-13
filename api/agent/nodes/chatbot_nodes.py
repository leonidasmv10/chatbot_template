"""
Nodos del agente de chatbot simple.
Maneja chat general e imágenes.
"""

import logging
from ..states.chatbot_state import ChatbotState
from ..services.intention_classifier_service import IntentionClassifierService
from ..providers.text_generation.text_generator_manager import text_generator_manager
from ..providers.test.test_manager import TestManager

logger = logging.getLogger(__name__)

class ChatbotNodes:

    def __init__(self):
        self.test_manager = TestManager.get_instance()
        self.intention_classifier = IntentionClassifierService()
        self.logger = logging.getLogger(__name__)

    def classify_intent_node(self, state: ChatbotState) -> ChatbotState:
        """
        Nodo para clasificar la intención del usuario.
        """
        try:
            user_input = state.get("user_input", "")
            if not user_input:
                state["detected_intent"] = "GENERAL_QUERY"
                return state

            detected_intent = self.intention_classifier.classify_intention(user_input)
            state["detected_intent"] = detected_intent
            self.logger.info(f"Intención detectada: {detected_intent}")

            return state

        except Exception as e:
            self.logger.error(f"Error en classify_intent_node: {e}")
            state["detected_intent"] = "GENERAL_QUERY"
            return state

    def general_query_node(self, state: ChatbotState) -> ChatbotState:
        """Nodo para consultas generales con text gen."""
        user_input = state.get("user_input", "")
        model = state.get("model", "gemini")

        try:
            generator = text_generator_manager.get_text_generator(model)
            response = generator.invoke(user_input)
            state["response"] = response.content
            self.logger.info("Consulta general procesada.")
        except Exception as e:
            self.logger.error(f"Error en general_query: {e}")
            state["response"] = "Lo siento, no pude generar una respuesta."

        return state

    def test_node(self, state: ChatbotState) -> ChatbotState:
        user_input = state.get("user_input", "")
        try:
            generator = self.test_manager.get_provider("hello_world")
            result = generator.execute(input=user_input)
            state["response"] = f"{result}"
        except Exception as e:
            state["response"] = "Lo siento, no pude test."
        return state

