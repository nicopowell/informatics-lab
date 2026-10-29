import { Route, Routes } from "react-router"
import SiteHeader from "./components/SiteHeader"
import SiteFooter from "./components/SiteFooter"

function App() {
  return (
    <>
      <SiteHeader />

      <main className="site-content">
        <Routes>
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </main>

      <SiteFooter />
    </>
  )
}

export default App