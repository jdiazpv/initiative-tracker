import { DynamoDB } from 'aws-sdk';

export const initiativesTable = new DynamoDB.DocumentClient({ region: process.env.REGION, apiVersion: '2012-08-10' });
