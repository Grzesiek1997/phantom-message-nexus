
// Cloudflare API Configuration
export const CLOUDFLARE_CONFIG = {
  API_TOKEN: 'OvSIWhF_8eDl-sYuuNp18rMU-XO8jveq558NR48N',
  BASE_URL: 'https://api.cloudflare.com/client/v4',
  ZONE_ID: '', // To be configured when needed
  
  // Security headers
  HEADERS: {
    'Authorization': 'Bearer OvSIWhF_8eDl-sYuuNp18rMU-XO8jveq558NR48N',
    'Content-Type': 'application/json',
  }
};

export class CloudflareAPI {
  private static readonly config = CLOUDFLARE_CONFIG;

  // Verify token functionality
  static async verifyToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.BASE_URL}/user/tokens/verify`, {
        method: 'GET',
        headers: this.config.HEADERS
      });

      const data = await response.json();
      console.log('🔐 Cloudflare Token Verification:', data);
      
      return response.ok && data.success;
    } catch (error) {
      console.error('❌ Cloudflare Token Verification Failed:', error);
      return false;
    }
  }

  // Get user info
  static async getUserInfo() {
    try {
      const response = await fetch(`${this.config.BASE_URL}/user`, {
        method: 'GET',
        headers: this.config.HEADERS
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to get Cloudflare user info:', error);
      return null;
    }
  }

  // Get zones
  static async getZones() {
    try {
      const response = await fetch(`${this.config.BASE_URL}/zones`, {
        method: 'GET',
        headers: this.config.HEADERS
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to get Cloudflare zones:', error);
      return null;
    }
  }
}

// Initialize token verification on app start
export const initializeCloudflare = async () => {
  console.log('🚀 Initializing Cloudflare API...');
  const isValid = await CloudflareAPI.verifyToken();
  
  if (isValid) {
    console.log('✅ Cloudflare Token Valid - API Ready');
  } else {
    console.warn('⚠️ Cloudflare Token Invalid - Check configuration');
  }
  
  return isValid;
};
