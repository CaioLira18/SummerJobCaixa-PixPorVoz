import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export const AppLayout = ({ isVisible, setIsVisible }) => {
  return (
    <div className="app-layout">
      <Header isVisible={isVisible} setIsVisible={setIsVisible} />
      <Outlet context={[isVisible]} /> 
      <Footer />
    </div>
  )
}