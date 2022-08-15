export default {
  'authenticated-item': `
    query {
      authenticatedItem {
        ... on User {
          id
          email
          name
          team {
            name
            abbreviation
          }
        }
      }
    }
  `,
  'begin-session': `
    mutation (
      $identity: String!,
      $secret: String!
    ) {
      authenticateUserWithPassword(
        email: $identity,
        password: $secret
      ) {
        ... on UserAuthenticationWithPasswordSuccess {
          item {
            id
            name,
          }
        }
        ... on UserAuthenticationWithPasswordFailure {
          message
        }
      }
    }
  `,
  'end-session': `
    mutation {
      endSession
    }
  `,
  'all-players': `
    query {
      playersCount
      players (take: 50, orderBy: {overallRank: asc}) {
        name
        team
        position
        positionWeight
        positionRank
        overallRank
        contract {
          team {
            name
          }
          salary
          years
        }
      }
    }
  `,
  'all-teams': `
    query  {
      teams (
        orderBy: {
          percentage: desc
        }
      ) {
        name
        abbreviation
        logo
        wins
        losses
        ties
        percentage
        contractTotals
      }
    }
  `,
  'contracts-by-team': `
    query ($abbr: String!) {
      contracts (
        where: {
          team: {
            abbreviation: {
              equals: $abbr
            }
          }
        }
        orderBy: {
          salary: desc
        }
      ) {
        player {
          name
          team
          position
          positionWeight
        }
        status
        salary
        years
      }
      team (
        where: {
          abbreviation: $abbr
        }
      ) {
        name
        contractTotals
      }
    }
  `
}
