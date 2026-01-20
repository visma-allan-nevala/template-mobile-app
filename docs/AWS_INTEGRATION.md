# AWS Integration Patterns

This guide covers common AWS integration patterns for mobile apps, based on patterns used in Visma products.

## Overview

Common AWS services used in mobile backends:
- **API Gateway**: REST/GraphQL API endpoints
- **Lambda**: Serverless compute
- **Cognito**: User authentication (alternative to Visma Connect)
- **S3**: File storage
- **CloudFront**: CDN for assets
- **DynamoDB**: NoSQL database
- **SQS/SNS**: Messaging and notifications

## API Gateway Integration

### Configure Base URL

```typescript
// src/core/config.ts
export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.your-domain.com',
    // For API Gateway stages:
    // staging: 'https://xxx.execute-api.eu-west-1.amazonaws.com/staging'
    // production: 'https://xxx.execute-api.eu-west-1.amazonaws.com/prod'
  },
};
```

### API Gateway Authentication

The API client supports Bearer token authentication compatible with API Gateway authorizers:

```typescript
// Tokens are automatically attached to requests
const response = await apiClient.get('/protected-endpoint');
```

For custom authorizers, modify the auth header format:

```typescript
// src/api/client.ts
private async getAuthHeaders(): Promise<Record<string, string>> {
  const token = await tokenManager.getValidAccessToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      // Add custom headers if needed:
      // 'x-api-key': config.api.apiKey,
    };
  }
  return {};
}
```

## AWS Cognito Integration

If using Cognito instead of Visma Connect:

### 1. Install Amplify

```bash
npx expo install aws-amplify @aws-amplify/react-native
```

### 2. Configure Amplify

```typescript
// src/services/auth/cognito.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.COGNITO_CLIENT_ID,
      signUpVerificationMethod: 'code',
    },
  },
});
```

### 3. Adapt Auth Store

```typescript
// Modify login to use Cognito
import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';

export const useAuthStore = create<AuthState>()((set) => ({
  // ... existing state

  login: async (email: string, password: string) => {
    const { isSignedIn, nextStep } = await signIn({ username: email, password });

    if (isSignedIn) {
      const user = await getCurrentUser();
      // Map Cognito user to app User type
      set({
        user: mapCognitoUser(user),
        isAuthenticated: true,
      });
    }
  },
}));
```

## S3 File Upload

### Direct Upload with Pre-signed URLs

```typescript
// src/services/storage.ts
import { apiClient } from '@api/client';

export async function uploadFile(file: File, type: string): Promise<string> {
  // 1. Get pre-signed URL from backend
  const { uploadUrl, fileUrl } = await apiClient.post<{
    uploadUrl: string;
    fileUrl: string;
  }>('/files/presigned-url', {
    contentType: file.type,
    fileType: type,
  });

  // 2. Upload directly to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  return fileUrl;
}
```

### React Native Image Upload

```typescript
import * as ImagePicker from 'expo-image-picker';

export async function uploadProfileImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];

  // Get pre-signed URL
  const { uploadUrl, fileUrl } = await apiClient.post('/files/presigned-url', {
    contentType: 'image/jpeg',
    fileType: 'profile',
  });

  // Read file and upload
  const response = await fetch(asset.uri);
  const blob = await response.blob();

  await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': 'image/jpeg' },
  });

  return fileUrl;
}
```

## CloudFront for Assets

Configure CDN URLs for static assets:

```typescript
// src/core/config.ts
export const config = {
  cdn: {
    baseUrl: process.env.CDN_BASE_URL || 'https://cdn.your-domain.com',
  },
};

// Usage
const imageUrl = `${config.cdn.baseUrl}/images/${imageId}.jpg`;
```

## Push Notifications with SNS

If using AWS SNS instead of Expo's push service:

```typescript
// Backend (Lambda)
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient({ region: 'eu-west-1' });

export async function sendPushNotification(
  deviceToken: string,
  platform: 'ios' | 'android',
  message: { title: string; body: string; data?: object }
) {
  const platformArn = platform === 'ios'
    ? process.env.SNS_IOS_ARN
    : process.env.SNS_ANDROID_ARN;

  // Create platform endpoint
  const endpoint = await createEndpoint(platformArn, deviceToken);

  // Send notification
  await sns.send(new PublishCommand({
    TargetArn: endpoint,
    Message: JSON.stringify({
      [platform === 'ios' ? 'APNS' : 'GCM']: JSON.stringify({
        aps: {
          alert: { title: message.title, body: message.body },
          sound: 'default',
        },
        data: message.data,
      }),
    }),
    MessageStructure: 'json',
  }));
}
```

## Environment Configuration

### EAS Build Secrets

Store AWS credentials securely:

```bash
# Set EAS secrets
eas secret:create --name AWS_ACCESS_KEY_ID --value xxx
eas secret:create --name AWS_SECRET_ACCESS_KEY --value xxx
```

### Environment Variables

```bash
# .env.staging
API_BASE_URL=https://api.staging.your-domain.com
CDN_BASE_URL=https://cdn.staging.your-domain.com
COGNITO_USER_POOL_ID=eu-west-1_xxxxx
COGNITO_CLIENT_ID=xxxxxx

# .env.production
API_BASE_URL=https://api.your-domain.com
CDN_BASE_URL=https://cdn.your-domain.com
COGNITO_USER_POOL_ID=eu-west-1_yyyyy
COGNITO_CLIENT_ID=yyyyyy
```

## Security Best Practices

1. **Never store AWS credentials in the app**
   - Use pre-signed URLs for S3 operations
   - Use Cognito/Visma Connect for auth

2. **Use IAM roles with least privilege**
   - API Gateway should assume roles with minimal permissions
   - Lambda functions should have scoped IAM policies

3. **Enable CloudTrail logging**
   - Monitor API access
   - Detect suspicious activity

4. **Use VPC for backend resources**
   - Keep databases private
   - Use NAT Gateway for outbound traffic

5. **Enable WAF on API Gateway**
   - Rate limiting
   - SQL injection protection
   - XSS protection

## Monitoring

### CloudWatch Metrics

Monitor key metrics:
- API Gateway: Latency, 4XX/5XX errors
- Lambda: Duration, errors, throttles
- Cognito: Sign-in attempts, failed logins

### X-Ray Tracing

Enable distributed tracing:

```typescript
// Lambda handler
import AWSXRay from 'aws-xray-sdk';

export const handler = async (event) => {
  const segment = AWSXRay.getSegment();
  segment.addAnnotation('userId', event.userId);
  // ...
};
```

## Resources

- [AWS Amplify React Native](https://docs.amplify.aws/react-native/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
