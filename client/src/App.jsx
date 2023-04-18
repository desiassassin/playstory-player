import PlaystoryPlayer from "./components/VideoPlayer";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
     return (
          <Router>
               <Routes>
                    <Route path=":playstoryID" element={<PlaystoryPlayer />}></Route>
               </Routes>
          </Router>
     );
}

export default App;
