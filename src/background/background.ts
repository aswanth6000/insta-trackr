// Background service worker for Instagram extension

interface FetchRequest {
    action: string
    userId: string
    endpoint: string
    maxId?: string
}

interface FetchResponse {
    success: boolean
    data?: {
        users?: Array<{
            pk: string
            username: string
            full_name: string
            profile_pic_url?: string
            is_verified?: boolean
        }>
        next_max_id?: string
        status?: string
    }
    error?: string
}

chrome.runtime.onMessage.addListener((request: FetchRequest, _sender: chrome.runtime.MessageSender, sendResponse: (response: FetchResponse) => void) => {
    if (request.action === 'fetchFollowers' || request.action === 'fetchFollowing') {
        handleFetchRequest(request, sendResponse);
        return true; // Keep the message channel open for async response
    }
    return false;
});

async function handleFetchRequest(request: FetchRequest, sendResponse: (response: FetchResponse) => void) {
    try {
        const endpoint = request.endpoint; // 'followers' or 'following'
        const url = new URL(`https://www.instagram.com/api/v1/friendships/${request.userId}/${endpoint}/`);

        if (request.maxId) {
            url.searchParams.set("max_id", request.maxId);
        }
        url.searchParams.set("count", "50");

        const response = await fetch(url.toString(), {
            headers: {
                "x-ig-app-id": "936619743392459",
                "x-requested-with": "XMLHttpRequest",
                "accept": "application/json"
            },
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        sendResponse({ success: true, data });
    } catch (error) {
        console.error('Error fetching data:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
}

