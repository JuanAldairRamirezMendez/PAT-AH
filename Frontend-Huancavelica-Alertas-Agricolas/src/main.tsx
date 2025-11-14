

  import { createRoot } from "react-dom/client";
  import App from "./App";
  import { BrowserRouter as Router } from "react-router-dom";
  import { LanguageProvider } from "./context/LanguageContext";
  import "./index.css";

  // Registrar Service Worker de PWA (dinámicamente para no romper los tests)
  // Evitar registrar SW en entornos de preview (github.dev / app.github.dev) donde hay proxies/redirecciones
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname || '';
    const isPreview = /github\.dev|app\.github\.dev/i.test(hostname);
    // Registrar solo en producción y fuera de previews
    if (!isPreview && import.meta.env.PROD) {
    const _pwaModule = 'virtual:pwa-register';
    import(_pwaModule)
      .then(({ registerSW }) => {
          const updateSW = registerSW({
            onRegistered(r: any) {
              console.log("SW registrado", r);
            },
            onNeedRefresh(): void {
              // Se detecta nueva versión; mostrar UI de actualización
              // Ejemplo simple: reload automático o mostrar toast
              try {
                if (confirm("Hay una nueva versión. ¿Deseas recargar para actualizar?")) {
                  updateSW(true);
                }
              } catch (e) {
                // En entornos sin ventana/confirm no hacemos nada
              }
            },
            onOfflineReady() {
              console.log("App listo para funcionar offline");
            },
          });
        })
        .catch(() => {
          // módulo virtual no disponible (por ejemplo en tests), ignorar
        });
    } else {
      // En previews (github.dev) no registramos el SW para evitar CORS/redirect problems
      console.log('PWA: registro del Service Worker omitido en entorno preview / dev');
    }
  }

  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(
      <LanguageProvider>
        <Router>
          <App />
        </Router>
      </LanguageProvider>
    );
  }
  