import { context } from './constants'

export const selectGlobal = state => state[context]

export const selectAuth = state => selectGlobal(state).auth
