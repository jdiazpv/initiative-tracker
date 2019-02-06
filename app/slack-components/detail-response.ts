import { InitiativeResponse } from '../initiative';
import { MEMBER_INTENT_DISPLAY, INITIATIVE_INTENT_DISPLAY, MEMBER_DISPLAY } from './display';
import { InitiativeIntent, Action, MemberIntent } from '../interactions';
import { MemberResponse } from '../member';

export class SlackDetailResponse {
  text: string;
  response_type: string;
  attachments: SlackMemberResponse[];
  constructor(initiative: InitiativeResponse) {
    this.text = initiative.name;
    this.response_type = 'in_channel'; //TODO what are the other options?
    this.attachments = initiative.members.map(member => new SlackMemberResponse(member, initiative));
    // TODO add an attachment for initiative itself, wich intents being join and join (no view details)
  }
}

class SlackMemberResponse {
  text: string;
  color: string;
  attachment_type: string;
  callback_id: string;
  fields: SlackField[];
  actions: SlackMemberAction[];

  constructor(member: MemberResponse, initiative: InitiativeResponse) {
    this.text = member.name;
    const memberType = member.champion ? 'CHAMPION' : 'MEMBER';
    this.color = MEMBER_DISPLAY[memberType].color;
    this.attachment_type = 'default'; //TODO what are the other options?
    this.callback_id = Action.MEMBER_ACTION;
    this.actions = Object.values(MemberIntent).map(intent => new SlackMemberAction(member, initiative, intent));
  }
}

class SlackField {
  title: string;
  value: string;
  short: boolean;
}

class SlackMemberAction {
  name: string;
  text: string;
  value: string;
  type: string;
  style: string;
  confirm: SlackConfirmAction;

  constructor(member: MemberResponse, initiative: InitiativeResponse, intent: MemberIntent) {
    this.name = intent;
    this.style = MEMBER_INTENT_DISPLAY[intent].style;
    this.value = initiative.initiativeId;
    this.text = MEMBER_INTENT_DISPLAY[intent].text;
    this.type = 'button'; //TODO what are the other options?
    this.confirm = new SlackConfirmAction(member, intent);
  }
}

class SlackConfirmAction {
  text: string;
  ok_text: string = 'Yes';
  dismiss_text: string = 'No';

  constructor(member: MemberResponse, intent: MemberIntent) {
    const verb = MEMBER_INTENT_DISPLAY[intent].confirmation[0];
    const action = MEMBER_INTENT_DISPLAY[intent].confirmation[1];
    this.text = `Are you sure you want to ${verb} ${member.name} ${action}?`;
  }
}
