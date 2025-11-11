import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { InstagramUser } from './utils/instagramApi'
import './App.css'

function Results() {
  const [nonFollowers, setNonFollowers] = useState<InstagramUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get results from URL parameters or storage
    const urlParams = new URLSearchParams(window.location.search)
    const storedData = urlParams.get('data')
    
    if (storedData) {
      try {
        const data = JSON.parse(decodeURIComponent(storedData))
        setNonFollowers(data)
      } catch (e) {
        console.error('Error parsing data:', e)
      }
    } else {
      // Try to get from storage as fallback
      chrome.storage.local.get('lastAnalysisResults').then((result) => {
        if (result.lastAnalysisResults) {
          setNonFollowers(result.lastAnalysisResults)
        }
      })
    }
    setLoading(false)
  }, [])

  const handleRefresh = () => {
    // Close this tab and user can run analysis from popup
    window.close()
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="header">
          <h1>Insta Trackr</h1>
          <p className="subtitle">Loading results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="results-container">
      <div className="header">
        <h1>Insta Trackr</h1>
        <p className="subtitle">People who don't follow you back</p>
      </div>

      {nonFollowers.length > 0 ? (
        <div className="results-section">
          <div className="results-header">
            <h2>People who don't follow you back</h2>
            <span className="count-badge">{nonFollowers.length}</span>
          </div>
          <div className="users-list">
            {nonFollowers.map(user => (
              <div key={user.pk} className="user-item">
                {user.profile_pic_url && (
                  <img
                    src={user.profile_pic_url}
                    alt={user.username}
                    className="user-avatar"
                    referrerPolicy="no-referrer-when-downgrade"
                    onError={(e) => {
                      // Fallback if image fails to load - show placeholder
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="56" height="56"%3E%3Crect width="56" height="56" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3E?%3C/text%3E%3C/svg%3E'
                    }}
                  />
                )}
                <div className="user-info">
                  <div className="user-name">
                    <a
                      href={`https://www.instagram.com/${user.username}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="username-link"
                    >
                      @{user.username}
                    </a>
                    {user.is_verified && <span className="verified-badge">✓</span>}
                  </div>
                  {user.full_name && (
                    <div className="user-full-name">{user.full_name}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <p className="help-text" style={{ marginBottom: '12px', color: '#666' }}>
              To run a new analysis, click the extension icon and click "Analyze Followers"
            </p>
          </div>
        </div>
      ) : (
        <div className="action-section">
          <p>No results found. Please run an analysis from the extension popup.</p>
          <button
            onClick={handleRefresh}
            className="analyze-button"
          >
            Open Extension
          </button>
        </div>
      )}
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  const root = createRoot(container)
  root.render(<Results />)
}

