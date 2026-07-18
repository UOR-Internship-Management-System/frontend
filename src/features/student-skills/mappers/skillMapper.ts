import type {
  IndividualSkill,
  SkillTaxonomy,
  SkillTaxonomyIndex,
  SkillTaxonomyPath,
} from '../types/studentSkillTypes'

export function deduplicateCanonicalSkills(skills: IndividualSkill[]): IndividualSkill[] {
  const canonical = new Map<string, IndividualSkill>()
  for (const skill of skills) {
    if (!canonical.has(skill.skillId)) {
      canonical.set(skill.skillId, skill)
    }
  }
  return [...canonical.values()]
}

export function indexSkillTaxonomy(taxonomy: SkillTaxonomy): SkillTaxonomyIndex {
  const skillsById = new Map<string, IndividualSkill>()
  const pathsBySkillId = new Map<string, SkillTaxonomyPath[]>()

  for (const cluster of taxonomy.clusters) {
    for (const category of cluster.categories ?? []) {
      for (const skill of category.skills ?? []) {
        skillsById.set(skill.skillId, skillsById.get(skill.skillId) ?? skill)
        const paths = pathsBySkillId.get(skill.skillId) ?? []
        if (!paths.some((path) => path.categoryId === category.categoryId)) {
          paths.push({
            clusterId: cluster.clusterId,
            clusterName: cluster.name,
            categoryId: category.categoryId,
            categoryName: category.name,
          })
        }
        pathsBySkillId.set(skill.skillId, paths)
      }
    }
  }

  return { skillsById, pathsBySkillId }
}
