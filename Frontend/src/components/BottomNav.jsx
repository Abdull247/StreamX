import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const tabs = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/browse', label: 'Browse', icon: '▦' },
  { to: '/search', label: 'Search', icon: '⌕' },
  { to: '/settings', label: 'Settings', icon: '⚙' }
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) => 'bottom-nav__item' + (isActive ? ' is-active' : '')}
        >
          <span className="bottom-nav__icon" aria-hidden="true">{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
