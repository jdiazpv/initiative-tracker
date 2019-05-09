import { WebClient } from '@slack/web-api';
import { getToken } from '../app-authorization';

const slack = new WebClient();

export async function sendDialogue(teamId: string, message: any) {
  const token = await getToken(teamId);
  message.token = token;
  console.log('Opening dialog with params', JSON.stringify(message));
  const response = await slack.dialog.open(message);
  console.log('Received response', JSON.stringify(response));
}
