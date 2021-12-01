import * as AWS from "aws-sdk";

const S3 = new AWS.S3();
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

  let prefix = `compressed/${Key.replace("uploads/", "")}`;
  prefix = prefix.replace(/\.[^/.]+$/, "");
  console.log("prefix", prefix);
  const params = {
    Bucket: BucketName,
    Prefix: prefix,
  };

  try {
    const data = await S3.listObjects(params).promise();
    console.log(data.Contents, "<<<all content");
    let objects = [];
    data.Contents.forEach(function (obj, index) {
      console.log(obj.Key, "<<<file path");
      objects.push({ Key: obj.Key });
    });
    let options = {
      Bucket: BucketName,
      Delete: {
        Objects: objects,
      },
    };
    try {
      await S3.deleteObjects(options).promise();
      console.log("File successfully deleted");
    } catch (error) {
      console.log("Check with error message " + error);
    }
  } catch (error) {
    return "There was an error viewing your album: " + error;
  }
};
