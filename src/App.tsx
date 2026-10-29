import './App.css'
import { Navigate, Route, Routes } from "react-router";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import ModulesPage from "./pages/ModulesPage";
import TopicsPage from "./pages/TopicsPage";
import ExperiencesPage from "./pages/ExperiencesPage";

function App() {
	return (
		<>
			<SiteHeader />

			<main className="site-content">
				<Routes>
					<Route path="/" element={<ModulesPage />} />
					<Route path="/about" element={<div>About</div>} />
					<Route path="/:moduleId" element={<TopicsPage />} />
					<Route path="/:moduleId/:topicId" element={<ExperiencesPage />} />
					<Route
						path="/:moduleId/:topicId/:experienceId"
						element={<div>Experience</div>}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>

			<SiteFooter />
		</>
	);
}

export default App;
