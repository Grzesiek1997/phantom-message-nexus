
// Type guards for better type safety
export function isValidObject(obj: any): obj is Record<string, any> {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}

export function isUserStoryRecord(obj: any): obj is Record<string, any> {
  return isValidObject(obj) && 'id' in obj && 'user_id' in obj;
}

export function isContactRecord(obj: any): obj is Record<string, any> {
  return isValidObject(obj) && 'id' in obj && 'contact_user_id' in obj;
}

export function isFriendRequestRecord(obj: any): obj is Record<string, any> {
  return isValidObject(obj) && 'id' in obj && 'sender_id' in obj && 'receiver_id' in obj;
}
