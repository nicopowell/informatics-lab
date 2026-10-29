import { Route, Routes } from "react-router";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import ModulesPage from "./pages/ModulesPage";

function App() {
	return (
		<>
			<SiteHeader />

			<main className="site-content">
				<Routes>
					<Route path="/" element={<ModulesPage />} />
				</Routes>
			</main>

			<SiteFooter />
		</>
	);
}

export default App;