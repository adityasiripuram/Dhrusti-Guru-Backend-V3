import AWS from 'aws-sdk';

const ENABLE_REKOGNITION = process.env.ENABLE_AWS_REKOGNITION === 'true';
const COLLECTION_ID = process.env.AWS_REKOGNITION_COLLECTION ?? 'teachers';

const rekognition = new AWS.Rekognition({
  region: process.env.AWS_REGION,
});

export interface FaceMatchResult {
  teacherId?: string;
  confidence?: number;
}

export async function ensureCollection(): Promise<void> {
  if (!ENABLE_REKOGNITION) return;
  try {
    await rekognition.createCollection({ CollectionId: COLLECTION_ID }).promise();
  } catch (err: any) {
    if (err.code !== 'ResourceAlreadyExistsException') {
      throw err;
    }
  }
}

export async function registerFace(teacherId: string, imageBytes: Buffer): Promise<string> {
  if (!ENABLE_REKOGNITION) {
    throw new Error('AWS Rekognition is not enabled. Set ENABLE_AWS_REKOGNITION=true');
  }

  await ensureCollection();

  const response = await rekognition.indexFaces({
    CollectionId: COLLECTION_ID,
    ExternalImageId: teacherId,
    Image: { Bytes: imageBytes },
    DetectionAttributes: ['DEFAULT']
  }).promise();

  const faceRecord = response.FaceRecords?.[0]?.Face;
  if (!faceRecord?.FaceId) {
    throw new Error('Failed to index face');
  }

  return faceRecord.FaceId;
}

export async function matchFace(imageBytes: Buffer): Promise<FaceMatchResult> {
  if (!ENABLE_REKOGNITION) {
    throw new Error('AWS Rekognition is not enabled. Set ENABLE_AWS_REKOGNITION=true');
  }

  await ensureCollection();

  const response = await rekognition.searchFacesByImage({
    CollectionId: COLLECTION_ID,
    Image: { Bytes: imageBytes },
    FaceMatchThreshold: 80,
    MaxFaces: 1
  }).promise();

  const match = response.FaceMatches?.[0];
  if (!match?.Face) {
    return { teacherId: undefined, confidence: undefined };
  }

  return {
    teacherId: match.Face.ExternalImageId,
    confidence: match.Similarity
  };
}
