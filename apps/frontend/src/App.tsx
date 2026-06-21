import "styles/globals.css";
import { Form } from "./components/ui/Form.tsx";
import { useState } from "react";
import { Interview } from "./components/ui/Interview";
import { Result } from "./components/ui/Result";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";

export function App() {

  const [page, setPage] = useState<"form" | "interview" | "result">("form");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <Form/> } />
        <Route path="/interview/:id" element={ <Interview/> } />
        <Route path="/result/:id" element= { <Result /> } />
      </Routes>
      <Toaster position="top-center"/>
    </BrowserRouter>
  );
}

export default App;
