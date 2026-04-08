# WebLucidDream App

This is a web application designed to help users achieve lucid dreams. It provides a personalized 30-day protocol based on a user's answers to a diagnostic questionnaire. The application is built with HTML, CSS, and JavaScript.

### Current Implementation

The project is structured as a single-page application with the following components:

*   **`index.html`**: The main entry point of the application. It contains the HTML structure for the diagnostic terminal, a paywall section, and the main dashboard. It uses Tailwind CSS for styling.
*   **`globals.css`**: This file contains all the styling for the application, including a dark, futuristic theme.
*   **`engine.js`**: The core logic of the application resides in this file. It includes:
    *   A diagnostic flow of questions to assess the user's current state.
    *   A "Lucidity Readiness Index" (LRI) calculator that uses a sigmoid function to determine the user's probability of achieving a lucid dream.
    *   A 30-day protocol generator that creates a personalized plan for the user.
    *   The engine uses a `lucidity_weight_matrix.json` file to inform its calculations.
*   **`lucidity_weight_matrix.json`**: This JSON file defines the weights for various factors that influence lucid dreaming, along with scientific explanations.
*   **Advice Files**:
    *   `ChemicalAdvice.md`: Provides advice on how neurochemicals can affect lucidity.
    *   `ChronobiologyAdvice.md`: Offers guidance on the relationship between sleep cycles and lucid dreaming.
    *   `CognitiveAdvice.md`: Contains tips on how to improve the cognitive skills necessary for lucid dreaming.

### How it Works

1.  **Diagnostic**: The user answers a series of questions about their habits and lifestyle.
2.  **Analysis**: The `engine.js` script calculates the user's Lucidity Readiness Index (LRI) based on their answers and the weights defined in `lucidity_weight_matrix.json`.
3.  **Protocol Generation**: A personalized 30-day protocol is generated to help the user improve their chances of having a lucid dream.
4.  **Dashboard**: The user can track their progress and access the protocol through a dashboard interface.

The application is designed with a "sovereign" and "DeFi" aesthetic, using a dark theme with orange and gold accents.
