/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useState, useEffect, useRef } from 'react'
import RoletaMain from './components/RoletaMain'
import RoletaAlt from './components/RoletaAlt'

const Home: React.FC = () => {
  return (
    <div className="flex h-fit min-h-fit flex-col bg-gray-100 py-8">
      <RoletaMain />
      <RoletaAlt />
    </div>
  )
}

export default Home
