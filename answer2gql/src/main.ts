import { ApolloServer, gql } from 'apollo-server';
import {buildSubgraphSchema} from '@apollo/federation'
import {
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import * as fs from 'fs'

import {resolvers} from './resolvers'
import {AnswerService} from './services'
import { AnswererContext } from './types';

const SCHEMA_FILENAME = './schema.gql'
const PORT = process.env.PORT || 4000;
const ANSWER_URL = process.env.ANSWER_URL



async function main() {

  console.log('Reading file schema from:', SCHEMA_FILENAME)
  const typeDefs = gql(fs.readFileSync(SCHEMA_FILENAME).toString('utf-8'))
  
  console.log('Connection to answer service by url:', ANSWER_URL)
  const answerer = new AnswerService(ANSWER_URL);
  if (!await answerer.isReady()) {
    throw new Error('Cannot connect to answer service by url: ' + ANSWER_URL)
  }

  const server = new ApolloServer({ 
    schema: buildSubgraphSchema([{ typeDefs, resolvers}]),
    introspection: true, 
    plugins: [
      // Current version by default displays landing page instead playground
      // This plugin fix it
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
    context: (): AnswererContext => ({
      answerer
    })
  });

  console.log("Starting server on port:", PORT);
  server.listen({ port: PORT, host: '0.0.0.0' }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
    
}

main()