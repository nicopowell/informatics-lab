import { useEffect, useState } from "react";
import { createHighlighter, type Highlighter } from "shiki";
import pseudocodeGrammar from "./pseudocode.tmLanguage.json";

const THEME = "vitesse-dark";
const BUNDLED_LANGS = ["javascript", "python", "cpp"];
const SUPPORTED_LANGS = new Set([...BUNDLED_LANGS, pseudocodeGrammar.name]);

// One shared highlighter: the theme, the grammars and the pseudocode rules load
// once, as a lazy chunk, and every code panel reuses the same instance.
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
	highlighterPromise ??= createHighlighter({
		themes: [THEME],
		langs: [...BUNDLED_LANGS, pseudocodeGrammar],
	});
	return highlighterPromise;
}

type HighlightedCodeProps = {
	language: string;
	code: string;
};

type Highlighted = {
	language: string;
	code: string;
	html: string;
};

function HighlightedCode({ language, code }: HighlightedCodeProps) {
	const [highlighted, setHighlighted] = useState<Highlighted | null>(null);

	useEffect(() => {
		if (!SUPPORTED_LANGS.has(language)) return;

		let cancelled = false;
		getHighlighter()
			.then((highlighter) => {
				if (!cancelled) {
					setHighlighted({
						language,
						code,
						html: highlighter.codeToHtml(code, { lang: language, theme: THEME }),
					});
				}
			})
			.catch(() => {});

		return () => {
			cancelled = true;
		};
	}, [code, language]);

	const html =
		highlighted && highlighted.language === language && highlighted.code === code
			? highlighted.html
			: null;

	if (html) return <span dangerouslySetInnerHTML={{ __html: html }} />;

	return (
		<pre>
			<code>{code}</code>
		</pre>
	);
}

export default HighlightedCode;
