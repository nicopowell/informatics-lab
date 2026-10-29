import "./App.css";
import { Navigate, Route, Routes } from "react-router";
import ModulesPage from "./pages/ModulesPage";
import TopicsPage from "./pages/TopicsPage";
import ExperiencesPage from "./pages/ExperiencesPage";
import SiteLayout from "./components/SiteLayout";

function App() {
	return (
		<Routes>
			<Route element={<SiteLayout />}>
				<Route path="/" element={<ModulesPage />} />
				<Route path="/about" element={<div>About</div>} />
				<Route path="/:moduleId" element={<TopicsPage />} />
				<Route path="/:moduleId/:topicId" element={<ExperiencesPage />} />
				<Route path="/:moduleId/:topicId/:experienceId" element={<div>Experience</div>} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Route>
		</Routes>
	);
}

export default App;
