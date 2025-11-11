import { useState, useEffect } from 'react'
import { getUserId } from './utils/instagramApi'
import type { InstagramUser } from './utils/instagramApi'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [nonFollowers, setNonFollowers] = useState<InstagramUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: '' })

  useEffect(() => {
    // Try to get user ID on mount
    getUserId().then(id => {
      if (id) {
        setUserId(id)
      } else {
        setError('Please open Instagram in a tab. The extension will detect your user ID automatically.')
      }
    })

    // Also listen for storage changes in case user ID gets stored after popup opens
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.instagramUserId?.newValue) {
        setUserId(changes.instagramUserId.newValue)
        setError(null)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const handleAnalyze = async () => {
    if (!userId) {
      const id = await getUserId()
      if (!id) {
        setError('Could not detect Instagram user. Please make sure you are logged into Instagram.')
        return
      }
      setUserId(id)
    }

    setLoading(true)
    setError(null)
    setNonFollowers([])
    setProgress({ current: 0, total: 0, stage: 'Starting...' })

    try {
      const currentUserId = userId
      if (!currentUserId) {
        setError('User ID not available')
        return
      }

      // Fetch followers
      setProgress({ current: 0, total: 1, stage: 'Fetching followers...' })
      const followers = await fetchAll(currentUserId, 'followers')
      setProgress({ current: 1, total: 2, stage: 'Fetching following...' })

      // Fetch following
      const following = await fetchAll(currentUserId, 'following')
      setProgress({ current: 2, total: 2, stage: 'Comparing lists...' })

      // Compare
      const followerIds = new Set(followers.map(u => u.pk))
      const notFollowingBack = following.filter(u => !followerIds.has(u.pk))

      // Store results in storage
      await chrome.storage.local.set({ lastAnalysisResults: notFollowingBack })

      // Open results in a new tab
      const resultsData = encodeURIComponent(JSON.stringify(notFollowingBack))
      const resultsUrl = chrome.runtime.getURL('results.html') + `?data=${resultsData}`
      chrome.tabs.create({ url: resultsUrl })

      setNonFollowers([]) // Clear popup results since we're opening in new tab
      setProgress({ current: 2, total: 2, stage: 'Complete! Opening results...' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data')
      console.error('Error:', err)
    } finally {
      setLoading(false)
      setTimeout(() => setProgress({ current: 0, total: 0, stage: '' }), 2000)
    }
  }

  const fetchAll = async (userId: string, endpoint: 'followers' | 'following'): Promise<InstagramUser[]> => {
    let results: InstagramUser[] = []
    let nextMaxId: string | null = null
    let pageCount = 0

    do {
      try {
        interface MessageResponse {
          success: boolean
          data?: {
            users?: InstagramUser[]
            next_max_id?: string
          }
          error?: string
        }

        const response = await chrome.runtime.sendMessage({
          action: endpoint === 'followers' ? 'fetchFollowers' : 'fetchFollowing',
          userId,
          endpoint,
          maxId: nextMaxId || undefined
        }) as MessageResponse

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch data')
        }

        const data = response.data
        if (data) {
          results = results.concat(data.users || [])
          nextMaxId = data.next_max_id || null
        }
        pageCount++

        setProgress({
          current: pageCount,
          total: 0,
          stage: `Fetched ${results.length} ${endpoint}...`
        })

        // Add delay to avoid rate limiting
        if (nextMaxId) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error)
        throw error
      }
    } while (nextMaxId)

    return results
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Insta Trackr</h1>
        <p className="subtitle">Find who doesn't follow you back</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: progress.total > 0
                  ? `${(progress.current / progress.total) * 100}%`
                  : '50%'
              }}
            />
          </div>
          <p className="progress-text">{progress.stage}</p>
        </div>
      )}

      {!loading && nonFollowers.length === 0 && (
        <div className="action-section">
          <button
            onClick={handleAnalyze}
            className="analyze-button"
            disabled={!userId}
          >
            {userId ? 'Analyze Followers' : 'Waiting for Instagram...'}
          </button>
          {!userId && (
            <p className="help-text">
              Please open <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a> in a new tab
            </p>
          )}
        </div>
      )}

      {!loading && (
        <div className="action-section">
          <p className="help-text" style={{ marginTop: '20px', color: '#666' }}>
            Results will open in a new tab so you can keep them open while browsing.
          </p>
        </div>
      )}
    </div>
  )
}

export default App
