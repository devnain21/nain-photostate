'use client'

import React from 'react'
import Link from 'next/link'

const MenuGrid = ({ items, viewMode = 'grid' }) => {
  return (
    <div className={`menu-grid ${viewMode === 'list' ? 'menu-list-view' : ''}`}>
      {items.map((item, index) => {
        const key = item.url || `${item.title}-${index}`

        const content = (
          <>
            {item.isNew && <span className="new-badge">NEW</span>}
            <i className={item.icon} style={{ animationDelay: `${index * 0.05}s` }}></i>
            <span>{item.title}</span>
          </>
        )

        return item.external ? (
          <a key={key} href={item.url} className="menu-box" data-category={item.category} target="_blank" rel="noopener noreferrer" style={{ animationDelay: `${index * 0.04}s` }}>
            {content}
          </a>
        ) : (
          <Link key={key} href={item.url} className="menu-box" data-category={item.category} style={{ animationDelay: `${index * 0.04}s` }}>
            {content}
          </Link>
        )
      })}
    </div>
  )
}

export default MenuGrid
