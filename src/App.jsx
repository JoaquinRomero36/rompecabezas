import { Route, Routes } from 'react-router-dom'
import Landing from './components/Landing/Landing'
import Puzzle from './components/Puzzle/Puzzle'
import ThemeToggle from './components/ThemeToggle/ThemeToggle'

export default function App() {
  return (
    <>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/puzzle" element={<Puzzle />} />
      </Routes>
    </>
  )
}