import logging
from typing import Dict, Any, Optional
from ..test.test_provider import TestProvider

# Configurar logging
logger = logging.getLogger(__name__)


class HelloWorldProvider(TestProvider):

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def execute(
        self, input: str, other: Optional[str] = None, **kwargs
    ) -> Dict[str, Any]:

        try:

            message = f"Hello World, Leonidas tu mensaje escrito para invocar esta función es: {input} {other or ''}!".strip()
            self.logger.info(f"🎨 {message}")
            return {"success": True, "message": message}

        except Exception as e:
            self.logger.error(f"❌ Error en test: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "No se pudo generar el message.",
            }
