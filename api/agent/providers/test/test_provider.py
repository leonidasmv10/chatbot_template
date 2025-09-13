from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class TestProvider(ABC):
    @abstractmethod
    def execute(self, input: str, other: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        raise NotImplementedError("Debes implementar este método en la subclase.")