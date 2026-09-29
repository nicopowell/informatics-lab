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
