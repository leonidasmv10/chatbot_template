"""
Vistas del agente.
Proporciona endpoints para chat e imágenes.
"""

import logging
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .logic.agent_manager import AgentManager

logger = logging.getLogger(__name__)

AGENT_MANAGER = AgentManager()

class AgentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get("message")
        model = request.data.get("model", "gemini")
        if not user_message:
            return Response({"error": "No se recibió mensaje."}, status=400)

        try:

            result = AGENT_MANAGER.execute_agent(
                agent_name="chatbot",
                user_input=user_message,
                text_generator_model=model,
            )

            # Si el resultado es un objeto con response y detected_intent
            if isinstance(result, dict):
                return Response(result)
            else:
                # Fallback para respuestas de texto simple
                return Response({"response": result, "detected_intent": "GENERAL_QUERY"})

        except Exception as e:
            logger.error(f"Error general en AgentView: {e}")
            return Response(
                {"error": f"Error interno del servidor: {str(e)}"}, status=500
            )
