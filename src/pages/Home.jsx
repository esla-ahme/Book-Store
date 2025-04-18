import React from 'react'

const Home = () => {
    const title = import.meta.env.VITE_APP_TITLE
  return (
    <div>{title}</div>
  )
}

export default Home