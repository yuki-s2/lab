import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Generate from "./pages/Generate";
import Assemble from "./pages/Assemble";

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Assemble />} />
          <Route path="/Generate" element={<Generate />} />
        </Routes>
      </Router>
  );
};

export default App;
