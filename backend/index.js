import { ApolloServer, gql } from 'apollo-server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const typeDefs = gql`
  type Text {
    id: Int!
    title: String!
    lines: [Line!]!
    createdAt: String!
  }

  type Line {
    id: Int!
    content: String!
    order: Int!
    textId: Int!
  }

  type Query {
    texts: [Text!]!
    text(id: Int!): Text
    linesByText(textId: Int!): [Line!]!
    searchLines(word: String!): [Line!]!
  }

  type Mutation {
    createText(title: String!): Text!
    createLine(textId: Int!, content: String!, order: Int!): Line!
    updateLine(id: Int!, content: String!): Line!
    deleteLine(id: Int!): Line!
  }
`;

const resolvers = {
  Query: {
    texts: () => prisma.text.findMany({ include: { lines: true } }),
    text: (_, args) => prisma.text.findUnique({ where: { id: args.id }, include: { lines: true } }),
    linesByText: (_, args) => prisma.line.findMany({ where: { textId: args.textId }, orderBy: { order: 'asc' } }),
    searchLines: (_, args) => {
      if (!args.word || args.word.trim() === '') return [];
      return prisma.line.findMany({
        where: {
          content: {
            contains: args.word,
          },
        },
        orderBy: { id: 'desc' },
      });
    },
  },
  Mutation: {
    createText: (_, args) => prisma.text.create({ data: { title: args.title } }),
    createLine: (_, args) => prisma.line.create({ data: args }),
    updateLine: (_, args) => prisma.line.update({ where: { id: args.id }, data: { content: args.content } }),
    deleteLine: (_, args) => prisma.line.delete({ where: { id: args.id } }),
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
