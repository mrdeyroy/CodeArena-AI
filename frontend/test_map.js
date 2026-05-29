const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:8000';

function mapBackendDifficulty(diff) {
  if (!diff) return 'Medium';
  const lowercase = diff.toLowerCase();
  if (lowercase === 'easy') return 'Easy';
  if (lowercase === 'hard') return 'Hard';
  return 'Medium';
}

function mapBackendProblem(p) {
  try {
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      difficulty: mapBackendDifficulty(p.difficulty),
      acceptanceRate: p.acceptance_rate || 0.0,
      estimatedTime: p.estimated_time || '',
      topics: p.concepts || [],
      companies: p.companies || [],
      status: p.status || 'Unsolved',
      isAIRecommended: p.is_ai_recommended || false,
      description: p.description || '',
      examples: p.examples || [],
      constraints: p.constraints ? p.constraints.split('\n') : [],
      hints: p.hints || [],
      editorial: p.editorial || '',
      starterCode: p.starter_code || {},
    };
  } catch (e) {
    console.error(`CRASH parsing problem: ${p.title} (Slug: ${p.slug})`);
    console.error(e);
    throw e;
  }
}

async function test() {
  console.log("Fetching problems from backend...");
  try {
    const res = await fetch(`${BASE_URL}/problems`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    console.log(`Successfully fetched ${data.length} problems from backend.`);
    
    console.log("Mapping problems through frontend parser...");
    const mapped = data.map(mapBackendProblem);
    console.log(`Success! Parsed and mapped ${mapped.length} problems without any crashes.`);
  } catch (e) {
    console.error("Test failed!");
    console.error(e);
  }
}

test();
