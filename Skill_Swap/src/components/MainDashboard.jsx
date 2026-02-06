import React from 'react'
import Navbar from './landingpage/Navbar'
import Home from './landingpage/Home'
import HowItWorks from './landingpage/HowItWork'
import AboutUs from './landingpage/AboutUs'

const MainDashboard = () => {
  return (
    <div>
      <Navbar/>
      <Home/>
      <HowItWorks/>
      <AboutUs/>
    </div>
  )
}

export default MainDashboard;
