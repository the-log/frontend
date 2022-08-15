import { Constructor } from "../types/defs";

const backendURL = 'https://api.log.football/api/graphql'
// const backendURL = 'http://localhost:3000/api/graphql'
const QueryMixin = <T extends Constructor<HTMLElement>>(Base: T) => {
  abstract class QueryMixinImpl extends Base {
    runQuery = async (query: String, variables = {}) => {
        return fetch(backendURL, {
          method: 'POST',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables,
          })
        }).then(r => r.json())
    }
  }

  return QueryMixinImpl;
};

export type QueryMixinImpl = InstanceType<ReturnType<typeof QueryMixin>>;

export default QueryMixin;
