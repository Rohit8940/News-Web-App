import "./App.css";
import Homepage from "./Pages/Homepage";
import { Route } from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import ArticlePage from "./Pages/ArticlePage";


function App() {
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      <Route path="/chats" component={Chatpage} />
      <Route path ="/ArticlePage" component={ArticlePage}/>
      
    </div>
  );
}

export default App;
