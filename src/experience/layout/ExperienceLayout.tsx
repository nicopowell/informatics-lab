import {
	useRef,
	useState,
	type CSSProperties,
	type KeyboardEvent as ReactKeyboardEvent,
	type PointerEvent as ReactPointerEvent,
	type ReactNode,
} from "react";
import type { ReferenceLanguage } from "../code-panel/CodePanel";
import CodeToggle from "../code-panel/CodeToggle";
import MarkdownDescription from "../markdown/MarkdownDescription";
import CodePanel from "../code-panel/CodePanel";
import "./experience-layout.css";

type ExperienceLayoutProps = {
	visualization: ReactNode;
	controls: ReactNode;
	description: string;
	reference?: ReferenceLanguage[];
};

const DEFAULT_PANEL_WIDTH = 41;
const MIN_PANEL_WIDTH = 25;
const MAX_PANEL_WIDTH = 65;

function ExperienceLayout({
	visualization,
	controls,
	description,
	reference,
}: ExperienceLayoutProps) {
	const [codeOpen, setCodeOpen] = useState(false);
	const hasCode = Boolean(reference);
	const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
	const [resizing, setResizing] = useState(false);
	const layoutRef = useRef<HTMLDivElement>(null);

	function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
		event.currentTarget.setPointerCapture(event.pointerId);
		setResizing(true);
	}

	function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
		if (!resizing || !layoutRef.current) return;

		const rect = layoutRef.current.getBoundingClientRect();
		const next = ((rect.right - event.clientX) / rect.width) * 100;
		setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, next)));
	}

	function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
		event.currentTarget.releasePointerCapture(event.pointerId);
		setResizing(false);
	}

	function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
		if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
		event.preventDefault();
		const delta = event.key === "ArrowLeft" ? 2 : -2;
		setPanelWidth((width) =>
			Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, width + delta)),
		);
	}

	return (
		<div className={hasCode && codeOpen ? "experience experience--with-code" : "experience"}>
			<div
				ref={layoutRef}
				className={
					resizing
						? "experience__layout experience__layout--resizing"
						: "experience__layout"
				}
				style={{ "--code-panel-width": `${panelWidth}%` } as CSSProperties}
			>
				<div className="experience__stage">
					<section className="experience__visualization">
						{visualization}
						{hasCode && (
							<CodeToggle open={codeOpen} onToggle={() => setCodeOpen(!codeOpen)} />
						)}
					</section>

					<div className="experience__controls">{controls}</div>

					<div className="experience__explanation">
						<MarkdownDescription source={description} />
					</div>
				</div>

				{reference && (
					<>
						<div
							className={
								resizing
									? "experience__resizer experience__resizer--active"
									: "experience__resizer"
							}
							role="separator"
							aria-orientation="vertical"
							aria-label="Resize code panel"
							tabIndex={0}
							onPointerDown={handlePointerDown}
							onPointerMove={handlePointerMove}
							onPointerUp={handlePointerUp}
							onKeyDown={handleKeyDown}
						/>
						<CodePanel languages={reference} open={codeOpen} />
					</>
				)}
			</div>
		</div>
	);
}

export default ExperienceLayout;
