import { useState, useEffect, use } from "react";
import './App.css';
import Button from "./components/Button/Button.jsx";
import Display from "./components/Display/Display.jsx";


function App() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
  }

  useEffect(() => {
    console.log("count:", count);
    if(count > 5) {
      setCount(0);
    }
  }
  , [count]);

  return (
    <>
      <h1>Hollo World</h1>
      <Button type="button" disabled={false} onClick={handleClick} >
        push!
      </Button>
      <Display count={count}>

      </Display>
    </>
  );
}

export default App
