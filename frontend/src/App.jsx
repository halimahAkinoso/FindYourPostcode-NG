import React, { useState } from 'react'
import CustomerFlow from './components/CustomerFlow.jsx'
import VendorDashboard from './components/VendorDashboard.jsx'

export default function App(){
  const [tab, setTab] = useState('customer')
  return (
    <div className="min-h-screen bg-[#f6f7f4]">
      <header className="sticky top-0 z-20 bg-[#0A4D2E] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FFC107] rounded-lg flex items-center justify-center font-bold text-[#0A4D2E]">F</div>
            <div><h1 className="font-bold text-xl leading-none">FindMe NG</h1><p className="text-xs opacity-80">Smart Address & Delivery Assistant</p></div>
          </div>
          <div className="flex bg-white/10 p-1 rounded-full">
            <button onClick={()=>setTab('customer')} className={`px-5 py-2 rounded-full text-sm font-semibold transition ${tab==='customer'?'bg-white text-[#0A4D2E]':'text-white/80'}`}>Customer</button>
            <button onClick={()=>setTab('vendor')} className={`px-5 py-2 rounded-full text-sm font-semibold transition ${tab==='vendor'?'bg-white text-[#0A4D2E]':'text-white/80'}`}>Vendor Dashboard</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {tab==='customer' ? <CustomerFlow/> : <VendorDashboard/>}
      </main>
    </div>
  )
}
