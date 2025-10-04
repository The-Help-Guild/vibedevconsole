// Input validation for send-status-update edge function

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validStatuses = ["published", "rejected"];

export interface StatusUpdateInput {
  email: string;
  appName: string;
  status: string;
  reviewNotes?: string;
  reviewedAt: string;
}

export function validateStatusUpdate(input: StatusUpdateInput): string | null {
  if (!input.email || !emailRegex.test(input.email)) {
    return "Invalid email format";
  }
  
  if (!input.appName || input.appName.length > 200) {
    return "Invalid app name (max 200 characters)";
  }
  
  if (!input.status || !validStatuses.includes(input.status)) {
    return "Invalid status (must be 'published' or 'rejected')";
  }
  
  if (input.reviewNotes && input.reviewNotes.length > 5000) {
    return "Review notes too long (max 5000 characters)";
  }
  
  if (!input.reviewedAt) {
    return "Missing reviewed timestamp";
  }
  
  return null;
}
