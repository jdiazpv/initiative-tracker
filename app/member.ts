export const MEMBER_TYPE: string = 'MEMBER';
export const TEAM: string = 'TEAM';

export function getMemberIdentifiers(teamId: string, slackUserId: string): string {
  return `${TEAM}:${teamId}|${MEMBER_TYPE}:${slackUserId}`;
}

export function getTeamIdentifier(teamId: string): string {
  return `${TEAM}:${teamId}`;
}

export class CreateMemberRequest {
  initiativeId: string;
  identifiers: string;
  teamId: string;
  type: string;
  name: string;
  slackUserId: string;
  champion: boolean;
  icon: string;
  joinedAt: string;

  constructor({ teamId, initiativeId, name, slackUserId, champion = false, icon }: CreateMemberRequestProperties) {
    this.initiativeId = `${initiativeId}`;
    this.identifiers = getMemberIdentifiers(teamId, slackUserId);
    this.type = MEMBER_TYPE;
    this.teamId = teamId;
    this.initiativeId = initiativeId;
    this.name = name;
    this.slackUserId = slackUserId;
    this.champion = champion;
    this.icon = icon;
    this.joinedAt = new Date().toDateString();
  }
}

interface CreateMemberRequestProperties {
  teamId: string;
  initiativeId: string;
  name: string;
  slackUserId: string;
  champion: boolean;
  icon: string;
}

export class MemberResponse {
  initiativeId: string;
  name: string;
  champion: boolean;
  role: string;
  slackUserId: string;
  icon: string;
  joinedAt: string;

  constructor(record: any) {
    this.initiativeId = record.initaitiveId;
    this.name = record.name;
    this.champion = record.champion;
    this.role = record.champion ? 'CHAMPION' : 'MEMBER';
    this.slackUserId = record.slackUserId;
    this.icon = record.icon;
    this.joinedAt = record.joinedAt;
  }
}

export class DeleteMemberRequest {
  initiativeId: string;
  identifiers: string;
  constructor({ initiativeId, teamId, slackUserId }: DeleteMemberRequestProperties) {
    this.initiativeId = initiativeId;
    this.identifiers = getMemberIdentifiers(teamId, slackUserId);
  }
}

interface DeleteMemberRequestProperties {
  initiativeId: string;
  teamId: string;
  slackUserId: string;
}
