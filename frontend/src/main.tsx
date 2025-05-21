import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const client = new ApolloClient({
  uri: 'http://localhost:4000', // ou http://backend:4000 si tu es en Docker
  cache: new InMemoryCache(),
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)