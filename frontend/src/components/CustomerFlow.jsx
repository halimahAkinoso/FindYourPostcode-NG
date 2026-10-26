import React, { useState } from 'react'
import { lookupPostcode, validatePostcode, createDelivery } from '../api.js'

const STATES = ["Lagos","Ogun","FCT","Oyo","Rivers","Kano"]

export default function CustomerFlow(){
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({state:'Ogun', lga:'', town:'', street:'', customer_name:'', phone:'', landmark:'', building_desc:''})
  const [lookup, setLookup] = useState(null)
  const [editablePostcode, setEditablePostcode] = useState("")
  const [valid, setValid] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(null)
  const [error, setError] = useState("")

  const handleLookup = async ()=>{
    setLoading(true)
    setValid(null)
    setError("")
    try{
      const res = await lookupPostcode({state: form.state, lga: form.lga, town: form.town, street: form.street})
      setLookup(res)
      setEditablePostcode(res.postcode.code || "")
      setStep(2)
    }catch(e){ 
      setError("Lookup failed: " + (e.response?.data?.detail || e.message))
    }
    setLoading(false)
  }

  const handleValidate = async ()=>{
    setLoading(true)
    setError("")
    try{
      const r = await validatePostcode(form.town, editablePostcode)
      setValid(r)
      if(r.valid) setTimeout(()=> setStep(3), 1000)
    } catch(err){
      setError("Validation error: " + JSON.stringify(err.response?.data || err.message))
      setStep(3)
    }
    setLoading(false)
  }

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setLoading(true)
    setError("")
    try{
      const payload = {
        customer_name: form.customer_name,
        phone: form.phone,
        state: form.state,
        lga: form.lga,
        town: form.town,
        street: form.street,
        postcode: editablePostcode,
        landmark: form.landmark,
        building_desc: form.building_desc,
        latitude: lookup?.postcode?.lat || 6.8191,
        longitude: lookup?.postcode?.lng || 3.9322
      }
      const res = await createDelivery(payload)
      setDone(res)
      setStep(4)
    }catch(err){ 
      setError("Save failed: " + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  return(
    <div className="grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex gap-2 mb-6">{[1,2,3,4].map(s=><div key={s} className={`h-2 flex-1 rounded-full ${step>=s?'bg-[#0A4D2E]':'bg-gray-200'}`} />)}</div>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border">{error}</div>}

        {step===1 && (
          <div>
            <h2 className="text-2xl font-bold">Find your postcode</h2>
            <p className="text-gray-500 text-sm mt-1">Enter building details — we find the official 11-char NIPOST code</p>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* STATE WITH PLACEHOLDER */}
              <div>
                <label className="text-xs text-gray-500">State</label>
                <select value={form.state} onChange={e=>setForm({...form, state:e.target.value})} className="w-full border rounded-xl p-3 mt-1">
                  <option value="">Select State</option>
                  {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* LGA WITH PLACEHOLDER */}
              <div>
                <label className="text-xs text-gray-500">LGA</label>
                <input 
                  placeholder="e.g. Ijebu North East"
                  value={form.lga} 
                  onChange={e=>setForm({...form,lga:e.target.value})} 
                  className="w-full border rounded-xl p-3 mt-1 placeholder:text-gray-400"
                />
              </div>

              {/* TOWN WITH PLACEHOLDER */}
              <div>
                <label className="text-xs text-gray-500">Town / District</label>
                <input 
                  placeholder="e.g. Irewon or Ijebu Ode"
                  value={form.town} 
                  onChange={e=>setForm({...form,town:e.target.value})} 
                  className="w-full border rounded-xl p-3 mt-1 placeholder:text-gray-400"
                />
              </div>

              {/* STREET WITH PLACEHOLDER */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Street & Building Number</label>
                <input 
                  placeholder="e.g. 12 Adefila Street, beside First Bank, yellow building"
                  value={form.street} 
                  onChange={e=>setForm({...form,street:e.target.value})} 
                  className="w-full border rounded-xl p-3 mt-1 placeholder:text-gray-400"
                />
              </div>
            </div>

            <button onClick={handleLookup} disabled={loading || !form.street || !form.town || !form.lga} className="mt-6 w-full bg-[#0A4D2E] text-white py-3 rounded-xl font-semibold disabled:opacity-50">
              {loading?'Finding your 11-char code...':'Find My Postcode'}
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">Format will be like OG 02 A09 DB 09 per postcode.gov.ng</p>
          </div>
        )}

        {step===2 && lookup && (
          <div>
            <h2 className="text-xl font-bold">Validate Postcode</h2>
            <div className="mt-4 bg-[#f6f7f4] p-4 rounded-xl">
              <div className="text-sm text-gray-500">Official Postcode (11-char NDAPS) — editable</div>
              <input 
                value={editablePostcode}
                onChange={e=>setEditablePostcode(e.target.value.toUpperCase())}
                placeholder="e.g. OG 02 A09 DB 09"
                className="mt-2 w-full text-2xl font-bold font-mono tracking-wide bg-white border-2 border-[#0A4D2E]/20 rounded-xl p-3 focus:border-[#0A4D2E] focus:outline-none placeholder:text-gray-300 placeholder:font-normal placeholder:text-lg"
              />
              <div className="text-xs text-gray-400 mt-2">Old 6-digit: {lookup.postcode.old6} | Format: FC 02 A09 DB 09</div>
              <div className="text-sm mt-2">District: {lookup.postcode.district} | LGA: {lookup.postcode.lga}</div>
            </div>

            {valid && valid.valid && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center">✓</div>
                  <div>
                    <h3 className="font-bold text-green-800">Postcode Verified Successfully!</h3>
                    <p className="text-sm text-green-700">Building code <span className="font-mono font-bold bg-white px-2 py-1 rounded">{valid.code}</span> confirmed by NIPOST</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button onClick={()=>setStep(1)} className="flex-1 border py-3 rounded-xl">Back</button>
              <button onClick={handleValidate} disabled={loading} className="flex-1 bg-[#FFC107] py-3 rounded-xl font-bold">{loading?'Checking...':'Validate & Continue'}</button>
            </div>
          </div>
        )}

        {step===3 && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold">Delivery details</h2>
            <div className="bg-green-50 p-3 rounded-xl mt-2 text-sm text-green-700">✓ Verified: <span className="font-mono font-bold">{editablePostcode}</span></div>
            <div className="grid gap-4 mt-4">
              <input required placeholder="e.g. Halimah Akinoso" value={form.customer_name} onChange={e=>setForm({...form,customer_name:e.target.value})} className="border rounded-xl p-3 placeholder:text-gray-400"/>
              <input required placeholder="e.g. 08012345678 or +2348012345678" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="border rounded-xl p-3 placeholder:text-gray-400"/>
              <input required placeholder="e.g. Opposite First Bank, near market" value={form.landmark} onChange={e=>setForm({...form,landmark:e.target.value})} className="border rounded-xl p-3 placeholder:text-gray-400"/>
              <textarea placeholder="e.g. Yellow bungalow, 2nd building after junction, black gate" value={form.building_desc} onChange={e=>setForm({...form,building_desc:e.target.value})} className="border rounded-xl p-3 placeholder:text-gray-400"/>
            </div>
            <button disabled={loading} type="submit" className="mt-6 w-full bg-[#0A4D2E] text-white py-3 rounded-xl font-semibold">{loading?'Saving...':'Save Delivery Record'}</button>
          </form>
        )}

        {step===4 && done && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
            <h2 className="text-2xl font-bold mt-4">Delivery Saved Successfully!</h2>
            <p className="text-sm mt-2">Postcode {done.postcode}</p>
            <button onClick={()=>{setStep(1); setDone(null); setLookup(null); setValid(null); setEditablePostcode("");}} className="block mx-auto mt-4 text-sm text-gray-500">New delivery</button>
          </div>
        )}
      </div>
      
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="font-bold">Placeholders Ready ✅</h3>
          <ul className="mt-3 space-y-2 text-xs text-gray-600">
            <li>State: Select State</li>
            <li>LGA: e.g. Ijebu North East</li>
            <li>Town: e.g. Irewon or Ijebu Ode</li>
            <li>Street: e.g. 12 Adefila Street...</li>
            <li>Postcode: e.g. OG 02 A09 DB 09</li>
          </ul>
        </div>
      </div>
    </div>
  )
}