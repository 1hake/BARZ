import { gql, useMutation } from '@apollo/client';

export const CREATE_LINE = gql`
  mutation CreateLine($textId: Int!, $content: String!, $order: Int!) {
    createLine(textId: $textId, content: $content, order: $order) {
      id
      content
      order
    }
  }
`;

export const UPDATE_LINE = gql`
  mutation UpdateLine($id: Int!, $content: String!) {
    updateLine(id: $id, content: $content) {
      id
      content
    }
  }
`;
