import React from "react";
import ReactDOM from "react-dom/client";
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "@fontsource/manrope/latin-700.css";
import "@fontsource/manrope/latin-800.css";
import "@fontsource/manrope/vietnamese-400.css";
import "@fontsource/manrope/vietnamese-500.css";
import "@fontsource/manrope/vietnamese-600.css";
import "@fontsource/manrope/vietnamese-700.css";
import "@fontsource/manrope/vietnamese-800.css";
import App from "./App";
import "./styles.css";
import "./story.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </LazyMotion>
  </React.StrictMode>,
);
