// Disable console in production
if (import.meta.env.PROD) {
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
