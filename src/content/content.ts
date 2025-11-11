// Content script to extract user ID from Instagram page

function getUserId(): string | null {
    // Get user ID from cookies (ds_user_id) - simplest and most reliable method
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        console.log(cookie);
        const [name, value] = cookie.trim().split('=');
        if (name === 'ds_user_id') {
            return value;
        }
    }

    return null;
}

// Listen for messages from popup
interface GetUserIdRequest {
    action: 'getUserId'
}

interface GetUserIdResponse {
    userId: string | null
}

chrome.runtime.onMessage.addListener((request: GetUserIdRequest, _sender: chrome.runtime.MessageSender, sendResponse: (response: GetUserIdResponse) => void) => {
    if (request.action === 'getUserId') {
        const userId = getUserId();
        sendResponse({ userId });
    }
    return true;
});


// Store user ID when available
function checkAndStoreUserId() {
    const userId = getUserId();
    if (userId) {
        chrome.storage.local.set({ instagramUserId: userId }).catch(err => {
            console.error('Error storing user ID:', err);
        });
    }
}

// Check immediately and store
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndStoreUserId);
} else {
    checkAndStoreUserId();
}

// Also check after a short delay in case cookies aren't ready yet
setTimeout(checkAndStoreUserId, 1000);

