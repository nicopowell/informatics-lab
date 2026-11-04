import { useState } from "react";
import CodeToggle from "../experience/code-panel/CodeToggle";
import HighlightedCode from "../experience/code-panel/HighlightedCode";
import MarkdownDescription from "../experience/markdown/MarkdownDescription";

const PSEUDOCODE_SAMPLE = `procedure insertionSort(A : list of numbers)
      n <- length(A)
      for i <- 1 to n - 1
          key <- A[i]
          j <- i - 1
          while j >= 0 and A[j] > key
              A[j + 1] <- A[j]
              j <- j - 1
          A[j + 1] <- key

   // lift the key, walk left, close the hole`;

const PYTHON_SAMPLE = `def insertion_sort(values):
      for i in range(1, len(values)):
          key = values[i]
          j = i - 1
          while j >= 0 and values[j] > key:
              values[j + 1] = values[j]
              j -= 1
          values[j + 1] = key`;

const JAVASCRIPT_SAMPLE = `function insertionSort(values) {
    for (let i = 1; i < values.length; i++) {
      const key = values[i]
      let j = i - 1
      while (j >= 0 && values[j] > key) {
        values[j + 1] = values[j]
        j -= 1
      }
      values[j + 1] = key
    }
  }`;

const CPP_SAMPLE = `void insertionSort(vector<int>& values) {
    for (int i = 1; i < (int)values.size(); ++i) {
      int key = values[i];
      int j = i - 1;
      while (j >= 0 && values[j] > key) {
        values[j + 1] = values[j];
        j = j - 1;
      }
      values[j + 1] = key;
    }
  }`;

const DESCRIPTION_SAMPLE = `# Insertion Sort

  Insertion Sort grows an **ordered prefix** one value at a time. Each pass lifts
  the first value of the unscanned tail into the hand, then walks left comparing
  the held value against the prefix.

  - **Worst and average case:** O(n²) comparisons and shifts
  - **Best case:** O(n), on an ordered array every pass costs one comparison
  - **Stable:** the scan stops on an equal value, so equal values keep their order`;

function KitPage() {
	const [codeOpen, setCodeOpen] = useState(false);

	return (
		<section className="kit">
			<p className="kit__kicker">Development only</p>
			<h1 className="kit__title">Kit Gallery</h1>
			<p className="kit__note">
				Scratch previews of the shared experience kit. This route only exists in dev builds.
			</p>

			<section className="kit__block">
				<h2 className="kit__block-title">CodeToggle</h2>
				<CodeToggle open={codeOpen} onToggle={() => setCodeOpen(!codeOpen)} />
				<p className="kit__state">State: {codeOpen ? "open" : "closed"}</p>
			</section>

			<section className="kit__block">
				<h2 className="kit__block-title">HighlightedCode - pseudocode</h2>
				<HighlightedCode language="pseudocode" code={PSEUDOCODE_SAMPLE} />
			</section>

			<section className="kit__block">
				<h2 className="kit__block-title">HighlightedCode - python</h2>
				<HighlightedCode language="python" code={PYTHON_SAMPLE} />
			</section>

			<section className="kit__block">
				<h2 className="kit__block-title">HighlightedCode - javascript</h2>
				<HighlightedCode language="javascript" code={JAVASCRIPT_SAMPLE} />
			</section>

			<section className="kit__block">
				<h2 className="kit__block-title">HighlightedCode — cpp</h2>
				<HighlightedCode language="cpp" code={CPP_SAMPLE} />
			</section>

			<section className="kit__block">
				<h2 className="kit__block-title">MarkdownDescription</h2>
				<MarkdownDescription source={DESCRIPTION_SAMPLE} />
			</section>
		</section>
	);
}

export default KitPage;
