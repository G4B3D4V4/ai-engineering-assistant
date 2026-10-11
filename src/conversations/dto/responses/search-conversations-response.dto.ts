import { ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { SearchResponse } from '../../../common/dtos/search-response.dto.js';
import { ConversationDto } from '../conversation.dto.js';

export class ConversationsResponseItem extends OmitType(ConversationDto, ['userId']) {}

export class SearchConversationsResponse extends SearchResponse {
  @ApiResponseProperty({ type: [ConversationsResponseItem] })
  declare data: ConversationsResponseItem[];
}
