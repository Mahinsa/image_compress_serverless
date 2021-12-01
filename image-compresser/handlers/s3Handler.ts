import * as AWS from "aws-sdk";
// import CONFIG from '../config/index';

const S3 = new AWS.S3();

class S3Handler {
  // private readonly S3_ACL = CONFIG.env.S3_ACL;

  async readStream({ Bucket, Key }: { Bucket: string; Key: string }) {
    try {
      return await S3.getObject({ Bucket, Key }).promise();
    } catch (error) {
      console.log("readStream-error", error);
      throw error;
    }
  }

  async writeStream({
    dataBuffer,
    bucketName,
    contentType,
    fileName,
  }: {
    dataBuffer: string;
    bucketName: string;
    contentType: string;
    fileName: string;
  }) {
    try {
      const s3UploadConfig: AWS.S3.Types.PutObjectRequest = {
        // ACL: "public-read",
        Body: dataBuffer,
        Bucket: bucketName,
        ContentType: contentType,
        Key: fileName,
      };
      console.log("s3UploadConfig", s3UploadConfig);
      await S3.putObject(s3UploadConfig).promise();
    } catch (error) {
      console.log("writeStream-error", error);
      throw error;
    }
  }
}

export const s3Handler = new S3Handler();
