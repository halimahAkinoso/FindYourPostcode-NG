import React, { useEffect, useState } from 'react'
import { getDeliveries, updateStatus } from '../api.js'

export default function VendorDashboard(){
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('All')
  const [q, setQ] = useState('')

  const load = async()=>{ try{ setData(await getDeliveries()) }catch(e){ console.error(e) } }
  useEffect(()=>{ load() },[])

  const filtered = data.filter(d=>{
    if(filter!=='All' && d.status!==filter) return false
    if(q && !`${d.customer_name} ${d.postcode} ${d.town} ${d.phone}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <div className="bg-white rounded-2xl p-6 border shadow-sm">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-2xl font-bold">Vendor Dashboard</h2>
        <div className="flex gap-2">
          <input placeholder="Search name/postcode/phone" value={q} onChange={e=>setQ(e.target.value)} className="border rounded-full px-4 py-2 text-sm w-64"/>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded-full px-4 py-2 text-sm"><option>All</option><option>Pending</option><option>In Transit</option><option>Delivered</option></select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-[#f6f7f4] p-4 rounded-xl"><div className="text-xs text-gray-500">Total Orders</div><div className="text-2xl font-bold">{data.length}</div></div>
        <div className="bg-[#f6f7f4] p-4 rounded-xl"><div className="text-xs text-gray-500">Pending</div><div className="text-2xl font-bold">{data.filter(d=>d.status==='Pending').length}</div></div>
        <div className="bg-[#f6f7f4] p-4 rounded-xl"><div className="text-xs text-gray-500">Delivered</div><div className="text-2xl font-bold">{data.filter(d=>d.status==='Delivered').length}</div></div>
      </div>

      <div className="overflow-auto mt-6">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b"><tr><th className="py-2">ID</th><th>Customer</th><th>Postcode</th><th>Area</th><th>Landmark</th><th>Phone</th><th>Status</th><th>Map</th></tr></thead>
          <tbody>
            {filtered.map(d=>(
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="py-3 font-mono font-bold">{d.id}</td>
                <td>{d.customer_name}</td>
                <td><span className="bg-[#0A4D2E] text-white px-2 py-1 rounded-full text-xs">{d.postcode}</span></td>
                <td>{d.town}, {d.lga}</td>
                <td className="max-w-[150px] truncate">{d.landmark}</td>
                <td><a href={`tel:${d.phone}`} className="text-[#0A4D2E] underline">{d.phone}</a></td>
                <td>
                  <select value={d.status} onChange={async e=>{ await updateStatus(d.id, e.target.value); load() }} className="border rounded-full px-2 py-1 text-xs">
                    <option>Pending</option><option>In Transit</option><option>Delivered</option><option>Failed</option>
                  </select>
                </td>
                <td><a target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${d.postcode}+${encodeURIComponent(d.landmark)}+${d.town}`} className="text-xs bg-[#FFC107] px-3 py-1 rounded-full font-bold">Open</a></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div className="text-center py-12 text-gray-400">No deliveries yet. Create one in Customer tab.</div>}
      </div>
    </div>
  )
}
