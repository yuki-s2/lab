import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Assemble from "./pages/Assemble";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Assemble />} />
      </Routes>
    </Router>
  );
};

export default App;
