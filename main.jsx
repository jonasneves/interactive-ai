import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import CNNCourseHub from "./cnn-course-hub";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CNNCourseHub />
  </React.StrictMode>
);
