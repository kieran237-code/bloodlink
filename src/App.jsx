import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes , Route } from 'react-router-dom'
import Home from'./components/Home'
import Login from './components/Login'
import Doctor from './components/Doctor'
import DoctorProfil from './components/DoctorProfil'
import Donor from './components/Donor'
import DonorProfil from './components/DonorProfil'
import BloodBank from './components/Bloodbank'
import BloodBankProfil from './components/BloodbankProfil'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Login/>} />
        <Route  path='/doctor' element={ <Doctor/> }/>
        <Route path='/profilDoc' element={<DoctorProfil />}/>
        <Route path='/donor' element={<Donor />}/>
        <Route path='/profilDon' element={<DonorProfil />}/>
        <Route path='/blood-bank' element={<BloodBank />} />
        <Route path='/bloodbankprofil'element={<BloodBankProfil />}/>
      </Routes>
    </>
  )
}

export default App
