package achievements

import (
	"justkile/magic-kingdom/internal/common"
	"justkile/magic-kingdom/internal/user"
	"log"
)

func CheckForNewAchievement(party string, userId string, newsList []*common.News) []*common.Achievement {
	if newsList == nil {
		return nil
	}

	userDto, userError := user.GetUserFromDb(party, userId)
	if userError != nil {
		log.Printf("Cannot get user:  %s", userError.Error())
		return nil
	}
	var newlyReachedAchievements []*common.Achievement
	reachableAchievementDefinitions := filter(AchievementDefinitions, userDto.Achievements)
	for _, achievementDefinition := range reachableAchievementDefinitions {
		if achievementDefinition.Predicate(newsList) {
			newlyReachedAchievements = append(newlyReachedAchievements, &achievementDefinition.Achievement)
		}
	}
	log.Printf("Reached achievement %s", newlyReachedAchievements)

	return newlyReachedAchievements

}

func filter(allAchievements []*common.AchievementDefinition, userAchievements []*common.Achievement) []*common.AchievementDefinition {
	var reachableAchievements []*common.AchievementDefinition
	for _, achievementDefinition := range allAchievements {
		if !existsAchievementDefinition(userAchievements, func(reachedAchievement *common.Achievement) bool {
			return reachedAchievement.Id == achievementDefinition.Achievement.Id
		}) {
			reachableAchievements = append(reachableAchievements, achievementDefinition)
		}
	}
	return reachableAchievements
}

func existsAchievementDefinition(achievements []*common.Achievement, predicate func(definition *common.Achievement) bool) bool {
	for _, achievement := range achievements {
		if predicate(achievement) {
			return true
		}
	}
	return false
}
