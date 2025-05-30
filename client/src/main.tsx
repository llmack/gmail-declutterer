import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set page title
document.title = "Gmail Declutter - Clean up your inbox";

// Add meta description
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Gmail Declutter helps you clean up your inbox by intelligently identifying and removing unnecessary emails including verification codes, promotions, and outdated content.';
document.head.appendChild(metaDescription);

createRoot(document.getElementById("root")!).render(<App />);
