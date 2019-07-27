import {LOG_OUT_USER, CHECK_LOG_IN, LOG_IN_USER } from './constants'


export function loginUser(data){
  return {
    type: LOG_IN_USER,
    data
  }
}

export function checkLogin(){
  return {
    type: CHECK_LOG_IN,
    data: {},
  }
}

export function logoutUser(){
  return {
    type: LOG_OUT_USER,
  }
}
