import type { Achievement } from './AchievementSystem'

// Helper to check and unlock achievements
export function checkAchievements(
  achievements: Achievement[],
  updates: Partial<Record<string, number>>
): { updated: Achievement[]; newlyUnlocked: Achievement[] } {
  const updated: Achievement[] = []
  const newlyUnlocked: Achievement[] = []

  achievements.forEach((achievement) => {
    if (achievement.unlocked) {
      updated.push(achievement)
      return
    }

    const progressUpdate = updates[achievement.id]
    if (progressUpdate !== undefined) {
      const newProgress = Math.min(achievement.requirement, progressUpdate)
      const wasUnlocked = achievement.progress >= achievement.requirement
      const nowUnlocked = newProgress >= achievement.requirement

      const updatedAchievement = {
        ...achievement,
        progress: newProgress,
        unlocked: nowUnlocked,
        unlockedAt: nowUnlocked ? new Date() : undefined,
      }

      updated.push(updatedAchievement)

      if (!wasUnlocked && nowUnlocked) {
        newlyUnlocked.push(updatedAchievement)
      }
    } else {
      updated.push(achievement)
    }
  })

  return { updated, newlyUnlocked }
}
