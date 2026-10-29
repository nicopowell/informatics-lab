export type ModuleInfo = {
	id: string;
	title: string;
	subtitle: string;
};

export const MODULES: ModuleInfo[] = [
	{
		id: "algorithms",
		title: "Algorithms & Data Structures",
		subtitle: "Sorting, searching, and tree traversal, one step at a time.",
	},
	{
		id: "operating-systems",
		title: "Operating Systems",
		subtitle: "CPU scheduling policies visualized step by step.",
	},
	{
		id: "networks",
		title: "Networks",
		subtitle: "How packets find their way through a network.",
	},
];
