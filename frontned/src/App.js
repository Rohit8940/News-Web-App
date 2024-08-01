import "./App.css";
import Homepage from "./Pages/Homepage";
import { useEffect } from "react";
import { Route,Redirect,useHistory} from "react-router-dom";
import Chatpage from "./Pages/Chatpage";
import ArticlePage from "./Pages/ArticlePage";


function App() {
  const history = useHistory();

  useEffect(() => {
    const currentPath = sessionStorage.getItem('currentPath');
    if (currentPath) {
      sessionStorage.removeItem('currentPath');
      history.replace(currentPath);
    }
  }, [history]);
  return (
    <div className="App">
      <Route path="/" component={ArticlePage} exact />
      <Route path="/chats" component={Chatpage} />
      <Route path ="/ArticlePage" component={ArticlePage}/>
      <Route path="/homepage" component={Homepage} />
      
      <Redirect from="/homepage" to="/" />
      
    </div>
  );
}

export default App;
