import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RecruitmentOS from "../app/RecruitmentOS";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("LTSV root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <RecruitmentOS />
  </StrictMode>,
);
