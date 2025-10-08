# TheBlock — Plataforma Interactiva de Teoría de Conjuntos

TheBlock es una experiencia educativa retro-minimalista pensada para estudiantes y docentes que desean dominar la teoría de conjuntos. Incluye lecciones guiadas, diagramas de Venn animados y un generador de ejercicios con retroalimentación visual paso a paso.

## 🌟 Características principales

- **Módulo "Aprende"** con lecciones interactivas, ejemplos guiados y diagramas animados para cada concepto clave (definiciones, tipos de conjuntos, operaciones y relaciones).
- **Módulo "Practica"** con generador configurable de ejercicios: elige operaciones, número de conjuntos (2–4), nivel de dificultad y modo de respuesta (opción múltiple, completar conjunto o interacción en diagrama).
- **Guía paso a paso** que muestra cada operación intermedia y explica visualmente el proceso cuando te equivocas, incluyendo un diagrama de Venn con la región correcta resaltada.
- **Retroalimentación instantánea** positiva y motivadora.
- **Gamificación** con rachas, XP, insignias y diario de aprendizaje para seguir el progreso.
- **Modo claro/oscuro** instantáneo y microinteracciones suaves.
- **Diseño responsivo** que se adapta a computadoras, tabletas y móviles.

## 🛠️ Tecnologías

- HTML5 semántico
- CSS3 (retro theme, layouts responsivos)
- JavaScript (ES2020) para la lógica interactiva, generador de ejercicios y animaciones SVG

## 🚀 Puesta en marcha

1. Clona o descarga este repositorio.
2. Abre `index.html` directamente en tu navegador favorito **o** levanta un servidor estático ligero.

```powershell
# Ejemplo usando PowerShell (Windows 10+)
Start-Process "http://localhost:5500/index.html"; npx serve .
```

> El servidor es opcional; cualquier servidor HTTP estático funciona (Live Server, http-server, etc.).

## 🧭 Navegación rápida

- `index.html`: Estructura de la aplicación y módulos.
- `assets/css/styles.css`: Estilos, temas claro/oscuro y microinteracciones.
- `assets/js/main.js`: Datos de lecciones, generador de ejercicios, motor de pasos y gamificación.

## 📌 Próximos pasos sugeridos

- Añadir más lecciones (por ejemplo, particiones, conjuntos potencia, leyes de De Morgan).
- Guardar el progreso en almacenamiento persistente o sincronizado.
- Exportar ejercicios y reportes para docentes.
- Incorporar accesibilidad adicional (navegación por teclado detallada en diagramas).

TheBlock está listo para acompañarte en cada bloque del aprendizaje de conjuntos. ¡Disfruta el viaje! 
