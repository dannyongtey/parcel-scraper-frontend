import { all } from 'redux-saga/effects'
import loginSaga from 'containers/Home/sagas'

export default function* rootSaga() {
  yield all([
    loginSaga()
  ])
}