var personnel = [
    {
      id: 5,
      name: "Luke Skywalker",
      pilotingScore: 98,
      shootingScore: 56,
      isForceUser: true,
    },
    {
      id: 82,
      name: "Sabine Wren",
      pilotingScore: 73,
      shootingScore: 99,
      isForceUser: false,
    },
    {
      id: 22,
      name: "Zeb Orellios",
      pilotingScore: 20,
      shootingScore: 59,
      isForceUser: false,
    },
    {
      id: 15,
      name: "Ezra Bridger",
      pilotingScore: 43,
      shootingScore: 67,
      isForceUser: true,
    },
    {
      id: 11,
      name: "Caleb Dume",
      pilotingScore: 71,
      shootingScore: 85,
      isForceUser: true,
    },
  ];

const jediPersonal = personnel.filter(person => {
    return person.isForceUser;
}).map(jedi => {
    return jedi.pilotingScore + jedi.shootingScore;
}).reduce((acc, score) => {
    return acc += score;
}, 0);

console.log('jediPersonal', jediPersonal);

// Use with reduce method only
const totalWithReduce = personnel.reduce((acc, person) => {
    if(person.isForceUser) {
        acc += (person.pilotingScore + person.shootingScore);
    }
    return acc;
}, 0);

console.log('totalWithReduce', totalWithReduce);

  