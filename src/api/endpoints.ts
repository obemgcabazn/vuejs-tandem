export const apiEndpoints = {
  topics: {
    getAllTopics: '/topics',
    getTopicById: (id: string) => `/topics/${id}`,
    getTasksByTopicId: (id: string) => `/topics/${id}/tasks`,
  },
  judgeUsersAnswer: {
    postToJudgeUsersAnswer: `/judge`,
    postToJudgeForHint: `/judge/hint`,
  },
  game: {
    getAllPublickRooms: `/rooms`,
  users: {
    patchMe: '/users/me',
  },
  game: {
    getAllPublickRooms: `/rooms`,
  },
} as const
