import { describe, expect, it } from 'vitest'
import { MODULES } from './modules/modules'
import {
  breadcrumbTrail,
  experiencePath,
  modulePath,
  resolveExperience,
  resolveModule,
  resolveTopic,
  topicPath,
} from './router'

describe('resolveModule', () => {
  it('finds a known module', () => {
    expect(resolveModule({ moduleId: 'algorithms' }, MODULES)?.id).toBe(
      'algorithms',
    )
  })

  it('returns null for an unknown module', () => {
    expect(resolveModule({ moduleId: 'nope' }, MODULES)).toBeNull()
  })

  it('returns null without a module id', () => {
    expect(resolveModule({}, MODULES)).toBeNull()
  })
})

describe('resolveTopic', () => {
  it('finds a known topic', () => {
    expect(
      resolveTopic({ moduleId: 'algorithms', topicId: 'sorting' }, MODULES)?.id,
    ).toBe('sorting')
  })

  it('returns null for an unknown topic', () => {
    expect(
      resolveTopic({ moduleId: 'algorithms', topicId: 'nope' }, MODULES),
    ).toBeNull()
  })

  it('returns null when the module is unknown', () => {
    expect(
      resolveTopic({ moduleId: 'nope', topicId: 'sorting' }, MODULES),
    ).toBeNull()
  })

  it('returns null without a topic id', () => {
    expect(resolveTopic({ moduleId: 'algorithms' }, MODULES)).toBeNull()
  })
})

describe('resolveExperience', () => {
  it('finds a known experience', () => {
    expect(
      resolveExperience(
        {
          moduleId: 'algorithms',
          topicId: 'sorting',
          experienceId: 'bubble-sort',
        },
        MODULES,
      )?.id,
    ).toBe('bubble-sort')
  })

  it('returns null for an unknown experience', () => {
    expect(
      resolveExperience(
        {
          moduleId: 'algorithms',
          topicId: 'sorting',
          experienceId: 'nope',
        },
        MODULES,
      ),
    ).toBeNull()
  })

  it('returns null when the topic is unknown', () => {
    expect(
      resolveExperience(
        {
          moduleId: 'algorithms',
          topicId: 'nope',
          experienceId: 'bubble-sort',
        },
        MODULES,
      ),
    ).toBeNull()
  })
})

describe('breadcrumbTrail', () => {
  it('shows only Home at the root', () => {
    expect(breadcrumbTrail({}, MODULES)).toEqual([{ label: 'Home', to: '/' }])
  })

  it('adds the module for a module route', () => {
    expect(breadcrumbTrail({ moduleId: 'algorithms' }, MODULES)).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Algorithms & Data Structures', to: '/algorithms' },
    ])
  })

  it('adds the topic for a topic route', () => {
    expect(
      breadcrumbTrail({ moduleId: 'algorithms', topicId: 'sorting' }, MODULES),
    ).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Algorithms & Data Structures', to: '/algorithms' },
      { label: 'Sorting', to: '/algorithms/sorting' },
    ])
  })

  it('adds the experience for an experience route', () => {
    expect(
      breadcrumbTrail(
        {
          moduleId: 'algorithms',
          topicId: 'sorting',
          experienceId: 'bubble-sort',
        },
        MODULES,
      ),
    ).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Algorithms & Data Structures', to: '/algorithms' },
      { label: 'Sorting', to: '/algorithms/sorting' },
      { label: 'Bubble Sort', to: '/algorithms/sorting/bubble-sort' },
    ])
  })

  it('stops at Home for an unknown module', () => {
    expect(breadcrumbTrail({ moduleId: 'nope' }, MODULES)).toEqual([
      { label: 'Home', to: '/' },
    ])
  })

  it('stops at the module for an unknown topic', () => {
    expect(
      breadcrumbTrail({ moduleId: 'algorithms', topicId: 'nope' }, MODULES),
    ).toEqual([
      { label: 'Home', to: '/' },
      { label: 'Algorithms & Data Structures', to: '/algorithms' },
    ])
  })
})

describe('paths', () => {
  it('builds the module path', () => {
    expect(modulePath('algorithms')).toBe('/algorithms')
  })

  it('builds the topic path', () => {
    expect(topicPath('algorithms', 'sorting')).toBe('/algorithms/sorting')
  })

  it('builds the experience path', () => {
    expect(experiencePath('algorithms', 'sorting', 'bubble-sort')).toBe(
      '/algorithms/sorting/bubble-sort',
    )
  })

  it('round-trips a built experience path through the resolvers', () => {
    const path = experiencePath('algorithms', 'sorting', 'bubble-sort')
    const [, moduleId, topicId, experienceId] = path.split('/')

    const resolved = resolveExperience(
      { moduleId, topicId, experienceId },
      MODULES,
    )

    expect(resolved?.id).toBe('bubble-sort')
  })
})
