import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./styles/variables.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/auth.css";
import "./styles/feed.css";
import "./styles/profile.css";
import "./styles/landing.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
