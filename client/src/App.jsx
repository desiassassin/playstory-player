import PlaystoryPlayer from "./components/VideoPlayer";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
     return (
          <Router>
               <Routes>
                    <Route path=":playstoryID" element={<PlaystoryPlayer />}></Route>
                    <Route path="*" element={<h1>404 page not found</h1>}/>
               </Routes>
          </Router>
     );
}

export default App;
