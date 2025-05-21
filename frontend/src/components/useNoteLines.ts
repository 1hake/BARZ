import { gql, useQuery } from '@apollo/client';

export const GET_LINES = gql`
  query LinesByText($textId: Int!) {
    linesByText(textId: $textId) {
      id
      content
      order
    }
  }
`;

export function useNoteLines(selectedNoteId: number | null) {
    const { data, loading } = useQuery(GET_LINES, {
        skip: selectedNoteId === null,
        variables: { textId: selectedNoteId },
    });
    return {
        lines: data?.linesByText || [],
        loading,
    };
}
