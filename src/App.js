import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import ScreenshotGallery from "./pages/ScreenshotGallery";

// adjust this path if your file is actually src/pages/experience/Experience.jsx
const Experience = lazy(() => import("./pages/Experience"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Vizwalk player */}
        <Route
          path="/experience"
          element={
            <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
              <Experience />
            </Suspense>
          }
        />

        {/* Screenshot gallery page */}
        <Route path="/gallery" element={<ScreenshotGallery />} />

        {/* Fallback: anything unknown → go home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
