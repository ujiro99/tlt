import React, { Suspense } from 'react'
import { useQuery } from 'react-query'
import { GoogleProfile, Profile } from '@/services/google/profile'

import './Profile.css'

const fetch = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: GoogleProfile.getProfile,
  })
}

function ProfileInner(): JSX.Element {
  const { data } = fetch()
  return (
    <div className="profile">
      <div>
        <img className="profile__photo" src={data?.photo} />
      </div>
      <div className="profile__info">
        <div className="profile__name">{data?.name}</div>
        <div className="profile__email">{data?.email}</div>
      </div>
    </div>
  )
}

function ProfileLoading(): JSX.Element {
  return (
    <div className="profile">
      <div>
        <div className="profile__photo mod--loading" />
      </div>
      <div className="profile__info">
        <div className="profile__name mod--loading"></div>
        <div className="profile__email mod--loading"></div>
      </div>
    </div>
  )
}

export function Profile(): JSX.Element {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileInner />
    </Suspense>
  )
}
