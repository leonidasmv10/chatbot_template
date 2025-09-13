import { useState, useRef, useEffect } from "react";
import { Send, PanelLeftClose, PanelLeft, Loader2, Brain, MessageSquare, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { textGeneration } from "../services/api";
import Sidebar from "./Sidebar";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini");
  const messagesEndRef = useRef(null);

  // Función para obtener nombre de intent
  const getIntentDisplayName = (intent) => {
    const intentNames = {
      "GENERAL_QUERY": "Consulta General",
      "TEST": "Test",
    };
    return intentNames[intent] || intent;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Mensaje de carga
    const loadingMessage = {
      id: Date.now() + 1,
      text: "",
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const data = await textGeneration(inputMessage, selectedModel);

      // Intentar parsear la respuesta como JSON si es una imagen generada
      let responseText = data.response;

      try {
        // Si la respuesta es un JSON string, parsearlo
        if (typeof data.response === 'string' && data.response.startsWith('{')) {
          const parsedResponse = JSON.parse(data.response);
          if (parsedResponse.success && parsedResponse.image_base64) {
            // Si contiene una imagen exitosa, usar el objeto parseado
            responseText = {
              image_base64: parsedResponse.image_base64,
              description: `Imagen generada: ${parsedResponse.prompt}`,
              parameters: parsedResponse.parameters
            };
          }
        } else if (typeof data.response === 'object' && data.response.success && data.response.image_base64) {
          // Si ya es un objeto con imagen exitosa
          responseText = {
            image_base64: data.response.image_base64,
            description: `Imagen generada: ${data.response.prompt}`,
            parameters: data.response.parameters
          };
        }
      } catch (error) {
        console.log('Error parsing JSON response:', error);
        // Si no es JSON válido, usar como texto normal
        responseText = data.response;
      }

      const botMessage = {
        id: Date.now() + 2,
        text: responseText,
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
        detectedIntent: data.detected_intent || "GENERAL_QUERY",
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.isLoading ? botMessage : msg))
      );
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      
      // Si el error es de sesión expirada, no mostrar mensaje de error
      if (error.message.includes('Sesión expirada')) {
        return;
      }

      const errorMessage = {
        id: Date.now() + 2,
        text: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.isLoading ? errorMessage : msg))
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "¡Hola! Soy tu asistente. ¿En qué puedo ayudarte?",
        isBot: true,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getMessageStyle = (message) => {
    const baseStyle = `max-w-[90%] sm:max-w-2xl px-4 py-3 rounded-2xl shadow-sm border`;

    if (!message.isBot) {
      return `${baseStyle} bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600`;
    }

    return `${baseStyle} ${
      darkMode
        ? "bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600/50 text-gray-100"
        : "bg-gradient-to-r from-white to-gray-50 border-gray-200 text-gray-800"
    }`;
  };

  // Estilos CSS para Markdown
  const markdownStyles = `
    .markdown-content {
      font-size: 0.875rem;
      line-height: 1.6;
      word-break: break-words;
    }
    
    .markdown-content h1, .markdown-content h2, .markdown-content h3, 
    .markdown-content h4, .markdown-content h5, .markdown-content h6 {
      font-weight: 600;
      margin: 0.75rem 0 0.5rem 0;
      line-height: 1.25;
    }
    
    .markdown-content h1 { font-size: 1.25rem; }
    .markdown-content h2 { font-size: 1.125rem; }
    .markdown-content h3 { font-size: 1rem; }
    
    .markdown-content p {
      margin: 0.5rem 0;
    }
    
    .markdown-content ul, .markdown-content ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    
    .markdown-content li {
      margin: 0.25rem 0;
    }
    
    .markdown-content code {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.875em;
    }
    
    .markdown-content pre {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 0.75rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 0.75rem 0;
    }
    
    .markdown-content pre code {
      background: none;
      padding: 0;
    }
    
    .markdown-content blockquote {
      border-left: 3px solid rgba(0, 0, 0, 0.2);
      margin: 0.75rem 0;
      padding-left: 1rem;
      font-style: italic;
    }
    
    .markdown-content a {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: rgba(0, 0, 0, 0.3);
    }
    
    .markdown-content a:hover {
      text-decoration-color: rgba(0, 0, 0, 0.6);
    }
    
    .markdown-content strong {
      font-weight: 600;
    }
    
    .markdown-content em {
      font-style: italic;
    }
    
    /* Estilos para modo oscuro */
    .dark .markdown-content code {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    .dark .markdown-content pre {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `;

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onNewChat={handleNewChat}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />

      {/* Chat principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className={`border-b px-4 py-3 flex items-center justify-between h-16 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mensajes */}
        <div
          className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-${
            darkMode ? "dark" : "light"
          }`}
        >
          {/* Contenedor centrado para las conversaciones */}
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] space-y-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center">
                  <Brain className="w-12 h-12 text-white" />
                </div>
                <div className="text-center space-y-4 max-w-lg">
                  <h3
                    className={`text-2xl font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    ¡Bienvenido a Chatbot!
                  </h3>
                  <p
                    className={`text-base leading-relaxed ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Soy tu asistente IA y estoy aquí para ayudarte.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <div
                    className={`px-4 py-3 rounded-lg text-sm ${
                      darkMode
                        ? "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    🤖 Consulta IA
                  </div>
                  <div
                    className={`px-4 py-3 rounded-lg text-sm ${
                      darkMode
                        ? "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    } transition-colors`}
                  >
                    🎨 Test
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isBot ? "justify-start" : "justify-end"
                }`}
              >
                <div className={`flex items-end space-x-3`}>
                  {message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`${getMessageStyle(message)}`}>
                    {message.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Procesando...</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {/* Contenido del mensaje */}
                        <div className="markdown-content">
                          {typeof message.text === "object" && message.text.image_base64 ? (
                            <div className="space-y-2">
                              <p>{message.text.description || "Imagen generada:"}</p>
                              <div className="flex justify-center">
                                <img
                                  src={`data:image/png;base64,${message.text.image_base64}`}
                                  alt="Imagen generada"
                                  className="rounded-lg max-w-full h-auto shadow-lg"
                                  onError={(e) => {
                                    console.error('Error loading image:', e);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                                <div
                                  style={{ display: 'none' }}
                                  className="text-red-500 text-sm p-4 border border-red-300 rounded-lg bg-red-50"
                                >
                                  Error al cargar la imagen. Verifique que el formato base64 sea correcto.
                                </div>
                              </div>
                            </div>
                          ) : (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {typeof message.text === "string" ? message.text : JSON.stringify(message.text, null, 2)}
                            </ReactMarkdown>
                          )}
                        </div>

                        {/* Información adicional */}
                        <div className="flex items-center justify-between pt-2 border-t border-current/10">
                          <p
                            className={`text-xs opacity-70`}
                          >
                            {message.timestamp}
                          </p>
                          
                          {/* Mostrar intent detectado si está disponible */}
                          {message.isBot && message.detectedIntent && (
                            <div className="flex items-center space-x-1">
                              <Sparkles className="w-3 h-3" />
                              <span className="text-xs opacity-70">
                                {getIntentDisplayName(message.detectedIntent)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!message.isBot && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        T
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input del chat */}
        <div
          className={`border-t p-4 ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="max-w-4xl mx-auto space-y-3 px-4">
            <div
              className={`flex items-end space-x-3 border-2 rounded-2xl p-3 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
                  : "bg-white border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
              }`}
            >
              <div className="flex-1 min-w-0">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu mensaje o describe una imagen..."
                  className={`w-full resize-none border-none outline-none bg-transparent placeholder-gray-500 text-sm leading-relaxed max-h-32 ${
                    darkMode
                      ? "text-white placeholder-gray-400"
                      : "text-gray-800"
                  }`}
                  rows={1}
                  style={{ minHeight: "20px" }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div
              className={`text-xs text-center ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Presiona Enter para enviar, Shift+Enter para nueva línea
            </div>
          </div>
        </div>

        {/* Estilos CSS personalizados para scrollbar */}
        <style jsx>{`
          .scrollbar-light::-webkit-scrollbar {
            width: 8px;
          }

          .scrollbar-light::-webkit-scrollbar-track {
            background: transparent;
          }

          .scrollbar-light::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
            transition: background 0.2s ease;
          }

          .scrollbar-light::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }

          .scrollbar-dark::-webkit-scrollbar {
            width: 8px;
          }

          .scrollbar-dark::-webkit-scrollbar-track {
            background: transparent;
          }

          .scrollbar-dark::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
            transition: background 0.2s ease;
          }

          .scrollbar-dark::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }

          /* Firefox scrollbar */
          .scrollbar-light {
            scrollbar-width: thin;
            scrollbar-color: #d1d5db transparent;
          }

          .scrollbar-dark {
            scrollbar-width: thin;
            scrollbar-color: #4b5563 transparent;
          }
        `}</style>

        {/* Estilos CSS para Markdown */}
        <style jsx global>
          {markdownStyles}
        </style>
      </div>
    </div>
  );
}
