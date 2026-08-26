import './App.css'
import Explorer from './components/Explorer/Explorer'
import { ExplorerContextProvider } from './contexts/ExplorerContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTE_STRING } from './helpers/Constants';

function App() {
  return (
        <>
            <BrowserRouter>
                <ExplorerContextProvider>
                    <Routes>
                        <Route path="/" element={<Navigate to={ROUTE_STRING.HOME} />} />
                        <Route path={ROUTE_STRING.FOLDER(':folderId')} element={<Explorer />} />
                    </Routes>
                </ExplorerContextProvider>
            </BrowserRouter>
        </>
    )
}

export default App
