import axios from 'axios'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const api = axios.create({ baseURL: API })
export const lookupPostcode = (data) => api.post('/api/postcode/lookup', data).then(r=>r.data)
export const validatePostcode = (town, postcode) => api.post('/api/postcode/validate', {town, postcode}).then(r=>r.data)
export const parseAddress = (address) => api.post(`/api/ai/parse?address=${encodeURIComponent(address)}`).then(r=>r.data)
export const createDelivery = (data) => api.post('/api/delivery', data).then(r=>r.data)
export const getDeliveries = () => api.get('/api/delivery').then(r=>r.data)
export const updateStatus = (id, status) => api.patch(`/api/delivery/${id}?status=${encodeURIComponent(status)}`).then(r=>r.data)
