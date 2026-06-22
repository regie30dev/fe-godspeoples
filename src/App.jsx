import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'

// Code-split pages so navigating to one shows the Suspense spinner in Layout
// while its chunk loads.
const Home = lazy(() => import('@/pages/Home'))
const People = lazy(() => import('@/pages/People'))
const Upload = lazy(() => import('@/pages/Upload'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="people" element={<People />} />
        <Route path="upload" element={<Upload />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
