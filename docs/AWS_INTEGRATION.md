# AWS Integration Patterns

## Common Services

| Service | Use Case |
|---------|----------|
| API Gateway | REST/GraphQL endpoints |
| Lambda | Serverless compute |
| Cognito | Auth (alternative to Visma Connect) |
| S3 | File storage |
| CloudFront | CDN |
| DynamoDB | NoSQL database |
| SNS | Push notifications |

## API Gateway

### Configure Base URL

```typescript
// src/core/config.ts
export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL,
    // staging: 'https://xxx.execute-api.eu-west-1.amazonaws.com/staging'
    // production: 'https://xxx.execute-api.eu-west-1.amazonaws.com/prod'
  },
};
```

### Auth Header (already configured in client.ts)

```typescript
Authorization: `Bearer ${token}`
// Add x-api-key header if using API key auth
```

## AWS Cognito (Alternative to Visma Connect)

### Install

```bash
npx expo install aws-amplify @aws-amplify/react-native
```

### Configure

```typescript
// src/services/auth/cognito.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      userPoolClientId: process.env.COGNITO_CLIENT_ID,
    },
  },
});
```

### Use

```typescript
import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';

const { isSignedIn } = await signIn({ username: email, password });
```

## S3 Upload (Pre-signed URLs)

```typescript
// 1. Get pre-signed URL from backend
const { uploadUrl, fileUrl } = await apiClient.post('/files/presigned-url', {
  contentType: 'image/jpeg',
});

// 2. Upload directly to S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: blob,
  headers: { 'Content-Type': 'image/jpeg' },
});
```

### React Native Image Upload

```typescript
import * as ImagePicker from 'expo-image-picker';

const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
if (!result.canceled) {
  const blob = await (await fetch(result.assets[0].uri)).blob();
  await fetch(uploadUrl, { method: 'PUT', body: blob });
}
```

## CloudFront CDN

```typescript
// src/core/config.ts
export const config = {
  cdn: { baseUrl: process.env.CDN_BASE_URL },
};

const imageUrl = `${config.cdn.baseUrl}/images/${imageId}.jpg`;
```

## Environment Variables

```bash
# .env.staging
API_BASE_URL=https://api.staging.your-domain.com
CDN_BASE_URL=https://cdn.staging.your-domain.com
COGNITO_USER_POOL_ID=eu-west-1_xxxxx
COGNITO_CLIENT_ID=xxxxxx

# EAS secrets (for builds)
eas secret:create --name AWS_ACCESS_KEY_ID --value xxx
```

## Security

| Rule | Reason |
|------|--------|
| Never store AWS creds in app | Use pre-signed URLs, OAuth |
| IAM least privilege | Minimal permissions for each service |
| CloudTrail logging | Audit API access |
| VPC for backend | Keep databases private |
| WAF on API Gateway | Rate limiting, injection protection |

## SNS Push (Alternative to Expo Push)

```typescript
// Backend Lambda
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const sns = new SNSClient({ region: 'eu-west-1' });
await sns.send(new PublishCommand({
  TargetArn: endpoint,
  Message: JSON.stringify({
    APNS: JSON.stringify({
      aps: { alert: { title, body }, sound: 'default' },
      data,
    }),
  }),
  MessageStructure: 'json',
}));
```

## Monitoring

| Service | Metrics |
|---------|---------|
| API Gateway | Latency, 4XX/5XX errors |
| Lambda | Duration, errors, throttles |
| Cognito | Sign-in attempts, failures |

Enable X-Ray for distributed tracing.
