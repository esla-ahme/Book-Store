import React from 'react'

const Home = () => {
    const title = import.meta.env.VITE_APP_TITLE
    return (
    <div>{title}
    
    <p>Welcome to the Home Page!</p>
   
    </div>
  )
}

export default Home