import React from 'react'
import { OAuth } from '@/services/google/oauth'
import { useOauthState } from '@/hooks/useOauthState'
import { Profile } from './Profile'
import './Account.css'

function Login({ startLogin }): JSX.Element {
  return (
    <button className="account__login" onClick={startLogin}>
      <img src="/images/btn_google_signin_light_normal_web@2x.png"></img>
    </button>
  )
}

export function Account(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useOauthState()

  const login = () => {
    OAuth.ensureToken().then((ret: string) => {
      setIsLoggedIn(true)
    })
  }

  const logout = () => {
    OAuth.logout().then((ret: boolean) => {
      setIsLoggedIn(!ret)
    })
  }

  return isLoggedIn ? (
    <div className="account">
      <Profile />
      <button className="account__logout" onClick={logout}>
        Logout
      </button>
    </div>
  ) : (
    <div className="account mod--login">
      <Login startLogin={login} />
    </div>
  )
}
