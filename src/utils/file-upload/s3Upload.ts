import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import s3 from './amazonS3';
import { getSignedUrl as getPresignedUrl } from '@aws-sdk/s3-request-presigner'; 
import dotenv from "dotenv";

dotenv.config();

dotenv.config({ path: '../../../../../backend/.env' });

const MY_DO_S3_BUCKET_NAME = process.env.MY_DO_S3_BUCKET_NAME!;
const MY_DO_S3_REGION = process.env.MY_DO_S3_REGION!;

export const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  mimeType: string
): Promise<string> => {
  const params = {
    Bucket: MY_DO_S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL:'public-read',
  };

  const command = new PutObjectCommand(params as any);
  await s3.send(command);

  return `https://${MY_DO_S3_BUCKET_NAME}.${MY_DO_S3_REGION}.cdn.digitaloceanspaces.com/${key}`;

};

export const deleteFromS3 = async (key: string) => {
  const deleteParams = {
    Bucket:MY_DO_S3_BUCKET_NAME,
    Key: key,
  };

  const command = new DeleteObjectCommand(deleteParams);
  await s3.send(command);
};


export const getSignedUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket:MY_DO_S3_BUCKET_NAME,
    Key: key,
  });

  return getPresignedUrl(s3, command, { expiresIn: 60 * 60 }); 
};

