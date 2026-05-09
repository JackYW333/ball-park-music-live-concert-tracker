import { useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import Overview from './pages/Overview.jsx'
import ToursPage from './pages/ToursPage.jsx'
import TourPage from './pages/TourPage.jsx'
import ConcertPage from './pages/ConcertPage.jsx'
import MembersPage from './pages/MembersPage.jsx'
import SongPage from './pages/SongPage.jsx'
import AlbumPage from './pages/AlbumPage.jsx'
import ReleasesPage from './pages/ReleasesPage.jsx'
import VenuePage from './pages/VenuePage.jsx'
import DebutsPage from './pages/DebutsPage.jsx'
import AllCountriesPage from './pages/AllCountriesPage.jsx'
import AllCitiesPage from './pages/AllCitiesPage.jsx'
import AllShowsPage from './pages/AllShowsPage.jsx'
import AllVenuesPage from './pages/AllVenuesPage.jsx'
import AllSongsPage from './pages/AllSongsPage.jsx'
import MemberPage from './pages/MemberPage.jsx'
import YearPage from './pages/YearPage.jsx'
import CountryPage from './pages/CountryPage.jsx'
import CityPage from './pages/CityPage.jsx'
import MyShowsPage from './pages/MyShowsPage.jsx'
import { useSetlists } from './hooks/useSetlists.js'
import { useAttendance } from './hooks/useAttendance.js'
import Search from './components/Search.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'

export default function App() {
  const data = useSetlists()
  const attendance = useAttendance()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <ScrollToTop />
      <header className="site-header">
        <NavLink to="/" className="site-logo" onClick={closeMenu}>
          Ball Park Music <span>Stats</span>
        </NavLink>
        <Search setlists={data.setlists} />
        <button
          className="nav-toggle"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <nav className={`site-nav${menuOpen ? ' site-nav--open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>Overview</NavLink>
          <NavLink to="/songs" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>All Songs</NavLink>
          <NavLink to="/releases" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>Releases</NavLink>
          <NavLink to="/members" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>Members</NavLink>
          <NavLink to="/tours" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>Tours</NavLink>
          <NavLink to="/my-shows" className={({ isActive }) => isActive ? 'active' : ''} onClick={closeMenu}>My Shows</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Overview data={data} />} />
        <Route path="/tours" element={<ToursPage data={data} />} />
        <Route path="/tour/:tourName" element={<TourPage data={data} attendance={attendance} />} />
        <Route path="/concert/:id" element={<ConcertPage data={data} attendance={attendance} />} />
        <Route path="/members" element={<MembersPage data={data} />} />
        <Route path="/song/:songName" element={<SongPage data={data} attendance={attendance} />} />
        <Route path="/year/:year" element={<YearPage data={data} attendance={attendance} />} />
        <Route path="/country/:countryCode" element={<CountryPage data={data} attendance={attendance} />} />
        <Route path="/city/:cityName/:countryCode" element={<CityPage data={data} attendance={attendance} />} />
        <Route path="/releases" element={<ReleasesPage data={data} />} />
        <Route path="/album/:albumId" element={<AlbumPage data={data} />} />
        <Route path="/venue/:venueName/:cityName/:countryCode" element={<VenuePage data={data} attendance={attendance} />} />
        <Route path="/debuts" element={<DebutsPage data={data} attendance={attendance} />} />
        <Route path="/countries" element={<AllCountriesPage data={data} />} />
        <Route path="/cities" element={<AllCitiesPage data={data} />} />
        <Route path="/shows" element={<AllShowsPage data={data} attendance={attendance} />} />
        <Route path="/my-shows" element={<MyShowsPage data={data} attendance={attendance} />} />
        <Route path="/venues" element={<AllVenuesPage data={data} />} />
        <Route path="/songs" element={<AllSongsPage data={data} />} />
        <Route path="/member/:memberId" element={<MemberPage data={data} attendance={attendance} />} />
      </Routes>
    </>
  )
}
