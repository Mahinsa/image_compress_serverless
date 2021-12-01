import { s3Handler } from "./s3Handler";
const sharp = require("sharp");

const Region = process.env.REGION;
const BucketName = process.env.BUCKET_NAME;

export const init = async (event) => {
  console.log("Env variables", { Region, BucketName });
  console.log("Event", event);
  const [record] = event.Records;
  const Bucket = record.s3.bucket.name;
  const Key = record.s3.object.key;
  console.log("Bucket", Bucket);
  console.log("Key", Key);

  // const original_image_url = `https://${Bucket}.s3.${Region}.amazonaws.com/${Key}`;
  // const compressed_image_url = `https://${Bucket}.s3.${Region}.amazonaws.com`;

  try {
    const object: any = await s3Handler.readStream({
      Bucket,
      Key,
    });
    console.log("object", object);

    const contentType: any = object.ContentType;
    const contentBody: any = object.Body;
    console.log("contentType", contentType, contentBody);

    const outputBuffer = async (contentType, contentBody) => {
      switch (contentType) {
        case "image/jpeg": {
          console.log("image/jpeg", contentBody);
          return await sharp(contentBody)
            .jpeg({
              quality: 50,
            })
            .toBuffer();
        }
        case "image/png": {
          console.log("image/png", contentBody);
          return await sharp(contentBody)
            .png({
              quality: 50,
            })
            .toBuffer();
        }
        default:
          console.log("image/svg", contentBody);
          return await sharp(contentBody)
            .webp({
              quality: 50,
            })
            .toBuffer();
      }
    };

    console.log("imagemin-files-before-writeStream", outputBuffer);

    await s3Handler.writeStream({
      dataBuffer: outputBuffer.toString(),
      bucketName: BucketName,
      contentType,
      fileName: `compressed/${Key.replace("uploads/", "")}`,
    });

    console.log("after-writeStream");
  } catch (error) {
    console.log("init-Error", error);
    throw error;
  }
};
