import { LOG_OUT_USER, LOG_IN_USER, CHECK_LOG_IN } from './constants'

const initState = {
    username: '',
    auth: {},
}

export default (state = initState, action) => {
    switch (action.type) {
        case LOG_IN_USER:
            return { ...state, auth: action.data }
        case LOG_OUT_USER:
            return { ...state, auth: {} }
        case CHECK_LOG_IN:
            console.log('called action')
            return state
        default:
            return state
    }
}