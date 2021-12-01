import { Serverless } from "serverless/aws";

const serverlessConfiguration: Serverless = {
  service: {
    name: "${self:custom.s3.bucketName}-compress-image",
  },
  frameworkVersion: ">=1.72.0",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
    s3: {
      bucketName: "compressedimgbucket",
    },
  },
  // Add the serverless-webpack plugin
  plugins: ["serverless-webpack", "serverless-pseudo-parameters"],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    stage: "${opt:stage, 'dev'}",
    // @ts-ignore
    region: "${opt:region, 'us-west-1'}",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      S3_ACL: "public-read",
      BUCKET_NAME: "${self:custom.s3.bucketName}",
      AWS_ACCOUNT: "825460230961",
      REGION: "us-west-1",
      // CLAMAV_PUBLIC_IP: "13.212.176.89",
      // CLAMAV_PORT: "3310",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "s3:ListBucket",
        Resource: ["arn:aws:s3:::${self:custom.s3.bucketName}"],
      },
      {
        Effect: "Allow",
        Action: "s3:*Object",
        Resource: ["arn:aws:s3:::${self:custom.s3.bucketName}/*"],
      },
    ],
  },

  functions: {
    // compress: {
    //   handler: "./image-compresser/handlers/compress.init",
    //   events: [
    //     {
    //       s3: {
    //         bucket: "${self:custom.s3.bucketName}",
    //         event: "s3:ObjectCreated:*",
    //         rules: [{ prefix: "uploads/", suffix: ".{jpg,png,svg}" }],
    //         existing: true,
    //       },
    //     },
    //   ],
    // },
    delete: {
      handler: "./image-compresser/delete-handler/delete.init",
      events: [
        {
          s3: {
            bucket: "${self:custom.s3.bucketName}",
            event: "s3:ObjectRemoved:*",
            rules: [{ prefix: "uploads/", suffix: ".{jpg,png,svg}" }],
            existing: true,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
