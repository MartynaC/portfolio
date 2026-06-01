import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export async function listRandomMedia() {
  const cmd = new ListObjectsV2Command({
    Bucket: process.env.R2_BUCKET,
    Prefix: "images/random/",
  });
  const res = await client.send(cmd);
  return (res.Contents || [])
    .map(obj => obj.Key.replace("images/random/", ""))
    .filter(f => f.length > 0);
}
