import { mockProblems, mockSkillNodes, mockSkillEdges, mockContests } from './mock-data';
import * as fs from 'fs';
import * as path from 'path';

const data = {
  problems: mockProblems,
  skills: mockSkillNodes,
  edges: mockSkillEdges,
  contests: mockContests,
};

const targetPath = path.resolve(__dirname, '../../../backend/app/db/mock-data.json');
fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
console.log('Dumped mock data to:', targetPath);
