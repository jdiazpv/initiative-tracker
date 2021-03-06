import {
  MarkdownText,
  Message,
  Section,
  DividerBlock,
  Action,
  ContextBlock,
  StaticSelect,
  Option,
  PlainText
} from 'slack';
import { Initiative, Status, getStatusDisplay } from '../initiatives';
import { BasicInitiative, Divider, MetaInformation } from './shared-messages';
import { Query } from '../queries';
import { ListAction, stringifyValue } from '../interactivity';

export class ListResponse implements Message {
  channel: string;
  blocks: (Section | DividerBlock | Action | ContextBlock)[];
  constructor({ initiatives, channelId, slackUserId, query }: ListResponseProperties) {
    this.channel = channelId;
    // Add main header content
    this.blocks = [new Header(slackUserId, query), new Filter(initiatives, query), new Divider()];

    // If there are results to show then add them as well as footer, otherwise show no initiatives found
    const filteredInitiatives = getFilteredInitiatives(initiatives, slackUserId, query);
    if (filteredInitiatives && filteredInitiatives.length) {
      const initiativeSections = getInitiativeSections(filteredInitiatives);
      this.blocks.push(...initiativeSections, new Footer());
    } else {
      this.blocks.push(new NoResults(query));
    }
  }
}

function getFilteredInitiatives(initiatives: Initiative[], slackUserId: string, query: Query): Initiative[] {
  return (
    initiatives
      // if a status was specified in query, filter to initiatives with that status
      .filter(initiative => !query || !query.status || query.status === initiative.status)
      // if an office was specified in query, filter to initiatives in that office
      .filter(initiative => !query || !query.office || query.office === initiative.office)
  );
}

function getInitiativeSections(initiatives: Initiative[]): (Section | DividerBlock | Action | ContextBlock)[] {
  return (
    initiatives
      .map(initiative => [new BasicInitiative(initiative), new MetaInformation(initiative), new Divider()])
      // flatten the array of arrays into a single array
      .reduce((all, block) => all.concat(block), [])
  );
}

interface ListResponseProperties {
  initiatives: Initiative[];
  channelId: string;
  slackUserId: string;
  query?: Query;
}

class Header implements Section {
  type: 'section' = 'section';
  text: MarkdownText;
  block_id: string;
  constructor(slackUserId: string, query: Query) {
    const status = query && query.status;
    const isPublic = query && query.isPublic;
    const office = query && query.office;
    const search = status ? `${getStatusDisplay(status).toLowerCase()}` : ' ';
    const boldStatus = status ? ` *${getStatusDisplay(status).toLowerCase()}* ` : ' ';
    const boldOffice = office ? ` in *${office}*` : '';
    const searchCommand = status ? `*/show-initiatives public, ${search}*` : '*/show-initiatives public*';
    const publicNote = `, sharing <!here> because <@${slackUserId}> requested it with the ${searchCommand} slash command`;
    const text = `Here are all the${boldStatus}initiatives we could find${boldOffice} :female-detective:${
      isPublic ? publicNote : ''
    }`.replace(/  +/g, '');
    this.text = { type: 'mrkdwn', text };
  }
}

class Filter implements Action {
  type: 'actions' = 'actions';
  elements: StaticSelect[];
  constructor(initiatives: Initiative[], query: Query) {
    const statuses = [...new Set(initiatives.map(initiative => initiative.status))];
    const statusFilter = new StatusFilter(statuses, query);
    this.elements = [statusFilter];
    const offices = [
      ...new Set(initiatives.filter(initiative => initiative.office).map(initiative => initiative.office))
    ];
    if (offices && offices.length) {
      this.elements.push(new OfficeFilter(offices, query));
    }
  }
}

class OfficeFilter implements StaticSelect {
  type: 'static_select' = 'static_select';
  placeholder: PlainText;
  options: Option[];
  initial_option: Option;
  action_id = ListAction.FILTER_BY_OFFICE;
  constructor(offices: string[], query: Query) {
    this.placeholder = {
      type: 'plain_text',
      text: 'Filter by office',
      emoji: true
    };
    this.options = offices.map(office => new OfficeOption(office, query));
    const queryOfficeInResults = offices.find(office => query && query.office && office === query.office);
    if (queryOfficeInResults) {
      this.initial_option = new OfficeOption(query.office, query);
    }
  }
}

class OfficeOption implements Option {
  text: PlainText;
  value: string;
  constructor(office: string, query: Query) {
    this.text = {
      type: 'plain_text',
      text: office
    };
    this.value = stringifyValue({ office, queryId: query && query.queryId });
  }
}

class StatusFilter implements StaticSelect {
  type: 'static_select' = 'static_select';
  placeholder: PlainText;
  options: Option[];
  initial_option: Option;
  action_id = ListAction.FILTER_BY_STATUS;
  constructor(statuses: Status[], query: Query) {
    this.placeholder = {
      type: 'plain_text',
      text: 'Filter by status',
      emoji: true
    };
    this.options = statuses.map(status => new StatusOption(Status[status], query));
    const queryStatusInResults = statuses.find(status => query && query.status && status === query.status);
    if (queryStatusInResults) {
      this.initial_option = new StatusOption(Status[query.status], query);
    }
  }
}

class StatusOption implements Option {
  text: PlainText;
  value: string;
  constructor(status: Status, query: Query) {
    this.text = {
      type: 'plain_text',
      text: getStatusDisplay(status)
    };
    this.value = stringifyValue({ status, queryId: query && query.queryId });
  }
}

class Footer implements Section {
  type: 'section' = 'section';
  text: MarkdownText;
  constructor() {
    const text = `Not seeing anything you want to join? :thinking_face: You should start a new initiative! :muscle:
    :tada: */add-initiative [name], [optional description], [optional #channel]* :confetti_ball:`.replace(/  +/g, '');
    this.text = { type: 'mrkdwn', text };
  }
}

class NoResults implements Section {
  type: 'section' = 'section';
  text: MarkdownText;
  constructor(query: Query) {
    const status = query && query.status;
    const statusSearch = status ? `*${getStatusDisplay(status).toLowerCase()}* ` : '';
    const office = query && query.office;
    const officeSearch = office ? ` in *${office}*` : '';
    const text = `Darn, we couldn't find any ${statusSearch}initiatives${officeSearch} :thinking_face: ...  maybe you should add one! :muscle:
    :tada: */add-initiative [name], [optional description], [optional #channel]* :confetti_ball:`.replace(/  +/g, '');
    this.text = { type: 'mrkdwn', text };
  }
}
