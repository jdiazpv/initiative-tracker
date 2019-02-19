import {
  SectionBlock,
  Message,
  DividerBlock,
  ActionsBlock,
  ContextBlock,
  PlainTextObject,
  MarkdownTextObject,
  StaticSelect,
  Button
} from 'slack';
import { InitiativeResponse } from '../initiative';
import { InitiativeNameStatusAndUpdateStatus, InitiativeDescription, MetaInformation } from './initiative-card';
import { MemberResponse } from '../member';
import { StatusUpdateAction } from '../interactions';
import { STATUS_UPDATE_DISPLAY } from './display';

export class StatusUpdateRequest implements Message {
  channel: string;
  text;
  blocks: (SectionBlock | DividerBlock | ActionsBlock | ContextBlock)[];
  constructor(initiative: InitiativeResponse, member: MemberResponse) {
    this.channel = member.slackUserId;
    const requestInfo = new RequestInfo(member);
    const nameAndStatus = new InitiativeNameStatusAndUpdateStatus(initiative);
    const description = new InitiativeDescription(initiative);
    const metaInformation = new MetaInformation(initiative);
    const updateActions = new UpdateStatusActions(initiative);
    this.blocks = [nameAndStatus, description, metaInformation, updateActions];
  }
}

class RequestInfo implements SectionBlock {
  type: 'section' = 'section';
  text: PlainTextObject | MarkdownTextObject;
  constructor(member: MemberResponse) {
    this.text = {
      type: 'mrkdwn',
      text: `Hey ${member.name.split(' ')[0]}, what's the status of this initiative?`
    };
  }
}

class UpdateStatusActions implements ActionsBlock {
  type: 'actions' = 'actions';
  elements: (StaticSelect | Button)[];
  constructor(initiative: InitiativeResponse) {
    this.elements = Object.values(StatusUpdateAction).map(intent => new ActionButton(initiative, intent));
  }
}

class ActionButton implements Button {
  type: 'button' = 'button';
  text: PlainTextObject;
  action_id: string;
  value?: string;
  constructor(initiative: InitiativeResponse, action: StatusUpdateAction) {
    this.action_id = action;
    this.value = JSON.stringify({ initiativeId: initiative.initiativeId });
    this.text = {
      type: 'plain_text',
      text: STATUS_UPDATE_DISPLAY[action].text
    };
  }
}
