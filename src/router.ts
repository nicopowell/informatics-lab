import type { Experience, ModuleInfo, Topic } from './modules/modules'

export type RouteParams = {
  moduleId?: string
  topicId?: string
  experienceId?: string
}

/*
 * Catalog resolution keeps the routing decisions in pure functions. React
 * Router matches the URL, but what a segment means — and where an unknown or
 * not-yet-built id should land — depends on the catalogue.
 */

export function resolveModule(
  params: RouteParams,
  modules: ModuleInfo[],
): ModuleInfo | null {
  if (!params.moduleId) {
    return null
  }

  return modules.find((entry) => entry.id === params.moduleId) ?? null
}

export function resolveTopic(
  params: RouteParams,
  modules: ModuleInfo[],
): Topic | null {
  const moduleInfo = resolveModule(params, modules)
  if (!moduleInfo || !params.topicId) {
    return null
  }

  return moduleInfo.topics.find((entry) => entry.id === params.topicId) ?? null
}

export function resolveExperience(
  params: RouteParams,
  modules: ModuleInfo[],
): Experience | null {
  const topic = resolveTopic(params, modules)
  if (!topic || !params.experienceId) {
    return null
  }

  return topic.experiences.find((entry) => entry.id === params.experienceId) ?? null
}

/*
 * Availability is derived, not stored: a hand-maintained flag drifts apart
 * from what is actually implemented, so callers pass the registered
 * experience ids instead and the predicates look at real entries. The
 * predicates only test membership, so they take the read-only view and the
 * exported registry cannot be mutated through them.
 */
export function topicIsAvailable(
  topic: Topic,
  implementedExperiences: ReadonlySet<string>,
): boolean {
  return topic.experiences.some((experience) =>
    implementedExperiences.has(experience.id),
  )
}

export function moduleIsAvailable(
  moduleInfo: ModuleInfo,
  implementedExperiences: ReadonlySet<string>,
): boolean {
  return moduleInfo.topics.some((topic) =>
    topicIsAvailable(topic, implementedExperiences),
  )
}

export function modulePath(moduleId: string): string {
  return `/${moduleId}`
}

export function topicPath(moduleId: string, topicId: string): string {
  return `/${moduleId}/${topicId}`
}

export function experiencePath(
  moduleId: string,
  topicId: string,
  experienceId: string,
): string {
  return `/${moduleId}/${topicId}/${experienceId}`
}

export type BreadcrumbItem = {
  label: string
  to: string
}

/*
 * The breadcrumb mirrors the URL hierarchy: Home, then every segment that
 * resolves against the catalogue. The last item is the page currently shown.
 */
export function breadcrumbTrail(
  params: RouteParams,
  modules: ModuleInfo[],
): BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [{ label: 'Home', to: '/' }]

  const moduleInfo = resolveModule(params, modules)
  if (!moduleInfo) {
    return trail
  }
  trail.push({ label: moduleInfo.title, to: modulePath(moduleInfo.id) })

  const topic = resolveTopic(params, modules)
  if (!topic) {
    return trail
  }
  trail.push({ label: topic.title, to: topicPath(moduleInfo.id, topic.id) })

  const experience = resolveExperience(params, modules)
  if (!experience) {
    return trail
  }
  trail.push({
    label: experience.title,
    to: experiencePath(moduleInfo.id, topic.id, experience.id),
  })

  return trail
}
