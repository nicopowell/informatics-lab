import ExperienceLayout from "@/experience/layout/ExperienceLayout";

const DESCRIPTION = `# Bubble Sort

  This is a placeholder page: the real experience replaces it in the next task.

  - The frame always renders visualization, controls and this description
  - The code panel appears when an experience provides a reference
  - Sections are required props, so a page cannot ship without them
  `;

function Placeholder() {
  return (
    <ExperienceLayout
      visualization={
        <p className="experience__status">Placeholder visualization</p>
      }
      controls={<span>Placeholder controls</span>}
      description={DESCRIPTION}
    />
  )
}

export default Placeholder