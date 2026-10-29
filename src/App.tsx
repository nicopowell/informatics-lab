import { Navigate, Route, Routes } from "react-router";
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
					<Route path="/about" element={<div>About</div>} />
					<Route path="/:moduleId" element={<div>Topics</div>} />
					<Route path="/:moduleId/:topicId" element={<div>Experiences</div>} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>

			<SiteFooter />
		</>
	);
}

export default App;
