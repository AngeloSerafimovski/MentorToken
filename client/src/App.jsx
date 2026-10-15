import React from "react";
import { Outlet } from "react-router-dom";

export function App() {
  return (
    <div id="main">
      <Outlet />
    </div>
  );
}