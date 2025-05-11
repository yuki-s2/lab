import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Generate from "./pages/Generate"
import Assemble from "./pages/Assemble";

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Generate />} />
          <Route path="/Assemble" element={<Assemble />} />
        </Routes>
      </Router>
  );
};

export default App
