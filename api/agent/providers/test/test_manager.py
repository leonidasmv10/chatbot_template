import logging
from typing import Dict, Any, Optional
from .test_provider import TestProvider
from .hello_world_provider import HelloWorldProvider

class TestManager:

    _instance = None
    _initialized = False
    
    def __new__(cls):
        """Implementa el patrón Singleton."""
        if cls._instance is None:
            cls._instance = super(TestManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Inicializa el manager solo una vez."""
        if not self._initialized:
            self.logger = logging.getLogger(__name__)
            self.providers: Dict[str, TestProvider] = {}
            self._initialize_providers()
            self._initialized = True
    
    def _initialize_providers(self):
        try:
            self._register_provider("hello_world", HelloWorldProvider())          
            self.logger.info(f"Test inicializados: {list(self.providers.keys())}")
            
        except Exception as e:
            self.logger.error(f"Error inicializando tests: {e}")
            raise
    
    def _register_provider(self, name: str, provider: TestProvider):
        if not isinstance(provider, TestProvider):
            raise ValueError(f"El provider debe heredar de TestProvider: {type(provider)}")
        self.providers[name] = provider
        self.logger.info(f"TestProvider registrado: {name} ({provider.__class__.__name__})")
    
    def get_provider(self, name: str) -> Optional[TestProvider]:
        return self.providers.get(name)
    
    def execute_provider(self, name: str, prompt: str, **kwargs) -> Dict[str, Any]:
        provider = self.get_provider(name)
        if provider is None:
            raise ValueError(f"Generador '{name}' no encontrado")
        
        return provider.execute(prompt, **kwargs)
    
    def get_available_providers(self) -> list:
        return [name for name, provider in self.providers.items() if provider.is_available()]
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

