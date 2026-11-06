import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Router from "./routes/Router";

function App() {
  return (
    <>
      <ToastContainer />
      <Router />
    </>
  );
}

export default App;
