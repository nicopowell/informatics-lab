import { describe, expect, it } from 'vitest'
import { MODULES } from './modules/modules'
import { EXPERIENCES } from './routes/experiences'
import { resolveExperience } from './router'

/*
 * The catalogue (src/modules/modules.ts) and the implemented pages
 * (src/routes/experiences.ts) are two separate sources of truth that have to
 * agree, and nothing in the application checks that they do. A route resolves
 * an experience id without looking at its module or topic, so a duplicated id
 * silently renders the wrong page, and a page registered under an id the
 * catalogue does not list is unreachable.
 *
 * These guards cover the contract between the two files, not the behaviour of
 * any single resolver (that is router.test.ts).
 */

type CatalogueEntry = {
  experienceId: string
  moduleId: string
  topicId: string
}

function catalogueExperiences(): CatalogueEntry[] {
  return MODULES.flatMap((moduleInfo) =>
    moduleInfo.topics.flatMap((topic) =>
      topic.experiences.map((experience) => ({
        experienceId: experience.id,
        moduleId: moduleInfo.id,
        topicId: topic.id,
      })),
    ),
  )
}

describe('catalogue consistency', () => {
  it('keeps experience ids unique across the whole application', () => {
    // A route only receives the experience id, so two experiences sharing an
    // id would resolve to whichever page the map happens to hold.
    const duplicates = catalogueExperiences()
      .map((entry) => entry.experienceId)
      .filter(
        (id, index, ids) => ids.indexOf(id) !== index,
      )

    expect(duplicates).toEqual([])
  })

  it('registers only experiences the catalogue lists', () => {
    // A key that is not in the catalogue can never be reached from the
    // catalogue screens, so the page exists but no card links to it.
    const listed = new Set(catalogueExperiences().map((entry) => entry.experienceId))
    const orphans = Object.keys(EXPERIENCES).filter((id) => !listed.has(id))

    expect(orphans).toEqual([])
  })

  it('resolves every registered experience through its catalogue path', () => {
    // The strongest check: for each implemented id, the module and topic that
    // list it must resolve back to it. This catches an id registered under a
    // name the catalogue spells differently.
    const missing = catalogueExperiences()
      .filter((entry) => entry.experienceId in EXPERIENCES)
      .filter(
        (entry) =>
          resolveExperience(
            {
              moduleId: entry.moduleId,
              topicId: entry.topicId,
              experienceId: entry.experienceId,
            },
            MODULES,
          ) === null,
      )
      .map((entry) => `/${entry.moduleId}/${entry.topicId}/${entry.experienceId}`)

    expect(missing).toEqual([])
  })

  it('marks a topic available only when it lists a registered experience', () => {
    // Topic availability is hand-maintained in the catalogue while experience
    // availability is derived from the map. A topic opened with no reachable
    // experience leads the user to an empty list.
    const inconsistent = MODULES.flatMap((moduleInfo) =>
      moduleInfo.topics
        .filter((topic) => {
          const implemented = topic.experiences.some(
            (experience) => experience.id in EXPERIENCES,
          )
          return topic.available !== implemented
        })
        .map((topic) => `/${moduleInfo.id}/${topic.id}`),
    )

    expect(inconsistent).toEqual([])
  })
})
