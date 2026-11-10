import { useEffect, useState } from "react";

import pseudocodeGrammar from "./pseudocode.tmLanguage.json";
import type { HighlighterCore } from "shiki";

const THEME = "vitesse-dark";
const SUPPORTED_LANGS = new Set(["javascript", "python", "cpp", pseudocodeGrammar.name]);

// One shared highlighter: core, engine, grammars and theme load once, as lazy
// chunks, and every code panel reuses the same instance.
let highlighterPromise: Promise<HighlighterCore> | null = null;

function getHighlighter(): Promise<HighlighterCore> {
	highlighterPromise ??= (async () => {
		const [
			{ createHighlighterCore },
			{ createJavaScriptRegexEngine },
			javascriptLang,
			pythonLang,
			cppLang,
			vitesseDark,
		] = await Promise.all([
			import("shiki/core"),
			import("shiki/engine/javascript"),
			import("shiki/langs/javascript.mjs"),
			import("shiki/langs/python.mjs"),
			import("shiki/langs/cpp.mjs"),
			import("shiki/themes/vitesse-dark.mjs"),
		]);

		return createHighlighterCore({
			themes: [vitesseDark.default],
			langs: [javascriptLang.default, pythonLang.default, cppLang.default, pseudocodeGrammar],
			engine: createJavaScriptRegexEngine(),
		});
	})();
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

	if (html) return <span className="highlighted-code" dangerouslySetInnerHTML={{ __html: html }} />;

	return (
		<pre>
			<code>{code}</code>
		</pre>
	);
}

export default HighlightedCode;
