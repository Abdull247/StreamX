import { useRef, useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, placeholder = 'Search videos…', initial = '', autoFocus = false }) {
  const [value, setValue] = useState(initial || '');
  const ref = useRef(null);

  const submit = (e) => {
    if (e) e.preventDefault();
    const q = value.trim();
    if (!q) return;
    onSearch(q);
  };

  return (
    <form className="search-bar" onSubmit={submit} role="search">
      <span className="search-bar__icon" aria-hidden="true">⌕</span>
      <input
        ref={ref}
        className="search-bar__input"
        type="search"
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Search"
      />
      <button className="search-bar__btn" type="submit">Search</button>
    </form>
  );
}
