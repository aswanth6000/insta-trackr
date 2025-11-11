// Utility functions for Instagram API calls

export interface InstagramUser {
    pk: string;
    username: string;
    full_name: string;
    profile_pic_url?: string;
    is_verified?: boolean;
}

export interface InstagramResponse {
    users: InstagramUser[];
    next_max_id?: string;
    status: string;
}

export async function fetchAll(
    userId: string,
    endpoint: 'followers' | 'following'
): Promise<InstagramUser[]> {
    let results: InstagramUser[] = [];
    let nextMaxId: string | null = null;

    do {
        try {
            interface MessageResponse {
                success: boolean
                data?: InstagramResponse
                error?: string
            }

            const response = await chrome.runtime.sendMessage({
                action: endpoint === 'followers' ? 'fetchFollowers' : 'fetchFollowing',
                userId,
                endpoint,
                maxId: nextMaxId || undefined
            }) as MessageResponse;

            if (!response.success) {
                throw new Error(response.error || 'Failed to fetch data');
            }

            const data: InstagramResponse | undefined = response.data;
            if (!data) {
                throw new Error('No data received from API');
            }
            results = results.concat(data.users || []);
            nextMaxId = data.next_max_id || null;

            // Add a small delay to avoid rate limiting
            if (nextMaxId) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    } while (nextMaxId);

    return results;
}

export async function getNonFollowers(userId: string): Promise<InstagramUser[]> {
    try {
        const [followers, following] = await Promise.all([
            fetchAll(userId, 'followers'),
            fetchAll(userId, 'following')
        ]);

        const followerIds = new Set(followers.map(u => u.pk));
        const notFollowingBack = following.filter(u => !followerIds.has(u.pk));

        return notFollowingBack;
    } catch (error) {
        console.error('Error getting non-followers:', error);
        throw error;
    }
}

export async function getUserId(): Promise<string | null> {
    try {
        // Get from storage (content script stores it when Instagram page loads)
        const stored = await chrome.storage.local.get('instagramUserId');
        if (stored.instagramUserId) {
            return stored.instagramUserId;
        }

        // If not in storage, user needs to visit Instagram first
        // The content script will store it automatically when they do
        return null;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
}

