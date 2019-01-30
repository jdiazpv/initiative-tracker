import { DynamoDB } from 'aws-sdk';
import { Initiative } from './initiative';
import { User } from '../users/user'
import { TableItem } from '../shared/table-item'

const initiatives = new DynamoDB.DocumentClient({ region: process.env.REGION });

export function getInitiativeByName(initiativeName: string): Promise<any> {
  const params = {
    TableName: process.env.INITIATIVES_TABLE,
    KeyConditionExpression: 'partitionKey = :pkey',
    ExpressionAttributeValues: {
      ':pkey': `INITIATIVE:${initiativeName}`,
    }
  };
  console.log('PARAMS ', params);
  return initiatives
    .query(params)
    .promise()
    .then(res => res.Items);
}

// I do not like scan strategy...
export function getInitiatives(): Promise<any> {
  const params = {
    TableName: process.env.INITIATIVES_TABLE,
    FilterExpression: 'begins_with(partitionKey, :pkey)',
    ExpressionAttributeValues: {
      ':pkey': 'INITIATIVE',
    }
  };
  console.log('PARAMS ', params);
  return initiatives
    .scan(params)
    .promise()
    .then(res => res.Items);
}

// export function getInitiativeByUser(initiativeId: string): Promise<any> {
//   const params = {
//     TableName: process.env.INITIATIVES_TABLE,
//     Key: { initiativeId }
//   };

//   return initiatives
//     .get(params)
//     .promise()
//     .then(res => res.Item);
// }

export function saveInitiative(initiative: Initiative): Promise<Initiative> {
  // This can be done better, but not sure what is the right mix of business logic and abstraction in this case
  const initiativeItem = new TableItem({
    'body': initiative,
    'partitionKey': `INITIATIVE:${initiative.id}`, //  ${initiative.constructor.name}:${initiative.id}
    'sortKey': 'INITIATIVE'
  })
  const params = { 
      TableName: process.env.INITIATIVES_TABLE, 
      Item: initiativeItem
  };
  return initiatives
    .put(params)
    .promise()
    .then(() => initiative);
}


export function joinInitiative(initiativeId: Initiative, user: User): Promise<User> {

  // TODO: Add checks to see if user is already part of an initiative
  // NOT SURE IF THIS NEEDS TO BE DONE WITHIN THE METHOD OR OUTSIDE OF THE METHOD. PROBABLY OUTSIDE.

  // CREATE INTERFACE HERIARCHY FOR TABLE ITEM, TABLE USER ITEM, INITIATIVE TABLE ITEM
  const userItem = new TableItem({
    'body': { role: user.role },
    'partitionKey': `INITIATIVE:${initiativeId}`, //  ${initiative.constructor.name}:${initiative.id}
    'sortKey': `USER:${user.slackId}`
  })
  const params = { 
    TableName: process.env.INITIATIVES_TABLE, 
    Item: userItem
};
  return initiatives
    .put(params)
    .promise()
    .then(() => user);

}