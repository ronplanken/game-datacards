import * as React from "react";
import { Routes, Route } from "react-router-dom";
import App from '../App';
import { Shared } from '../Pages/Shared';

export const AppRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="shared/:Id" element={<Shared />} />
      </Routes>
  );
}
