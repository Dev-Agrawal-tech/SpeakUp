export type ScenarioLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export interface Scenario {
  id: string
  title: string
  prompt: string
  duration: number
  level: ScenarioLevel
}

export interface ScenarioTrack {
  id: string
  title: string
  description: string
  accent: string
  scenarios: Scenario[]
}

const levels: ScenarioLevel[] = ['Beginner', 'Beginner', 'Intermediate', 'Intermediate', 'Advanced']

function createScenarios(trackId: string, topics: Array<[string, string]>): Scenario[] {
  return topics.map(([title, prompt], index) => ({
    id: `${trackId}-${index + 1}`,
    title,
    prompt,
    duration: index % 3 === 0 ? 60 : index % 3 === 1 ? 90 : 120,
    level: levels[index % levels.length],
  }))
}

export const scenarioTracks: ScenarioTrack[] = [
  {
    id: 'interview', title: 'Interview', description: 'Turn nerves into clear, memorable answers.', accent: 'from-blue-500 to-cyan-300',
    scenarios: createScenarios('interview', [
      ['Tell me about yourself', 'You are meeting an HR interviewer. Give a clear 60-second introduction covering who you are, your strengths, and your goal.'],
      ['Why this role?', 'Explain why you want this role and how your skills can help the company.'],
      ['Your proudest project', 'Describe a project you are proud of using the problem, your action, and the result.'],
      ['A difficult challenge', 'Answer: Tell me about a difficult challenge and how you solved it.'],
      ['Your biggest strength', 'Share one real strength, a brief example, and how it helps at work.'],
      ['A weakness you are improving', 'Name a genuine development area and explain the practical steps you take to improve it.'],
      ['Handling disagreement', 'Describe a time you disagreed with a teammate and how you handled it respectfully.'],
      ['Leadership example', 'Tell the interviewer about a time you took ownership or led others.'],
      ['Career gap explanation', 'Explain a career or study gap confidently, focusing on what you learned.'],
      ['Technical idea, simply', 'Explain a technical concept from your field to a non-technical interviewer.'],
      ['Salary expectation', 'Respond professionally when asked about your salary expectation.'],
      ['Why should we hire you?', 'Give a focused answer connecting your skills, attitude, and the role.'],
      ['Five-year direction', 'Explain where you want to grow in five years and how this role fits.'],
      ['Panel interview', 'Introduce yourself to a panel and give a concise summary of your value.'],
      ['Questions for the interviewer', 'Ask two thoughtful questions at the end of an interview.'],
    ]),
  },
  {
    id: 'presentation', title: 'PPT Presentation', description: 'Present ideas with structure and presence.', accent: 'from-violet-500 to-fuchsia-300',
    scenarios: createScenarios('presentation', [
      ['Open a class presentation', 'Open a presentation on a topic of your choice with a hook, purpose, and agenda.'],
      ['Explain one slide', 'Explain a data-heavy slide in simple language to classmates.'],
      ['Present project results', 'Present your project outcome: goal, work done, and result.'],
      ['Introduce a team', 'Introduce your project team and explain each member’s contribution.'],
      ['Product demo', 'Present a new product demo clearly to an audience.'],
      ['College seminar', 'Deliver the opening minute of a college seminar.'],
      ['Business update', 'Give a concise weekly update to your manager and teammates.'],
      ['Explain a chart', 'Walk an audience through a chart and state the key insight.'],
      ['Handle a question', 'Answer an audience question when you do not know every detail.'],
      ['Pitch a recommendation', 'Recommend a solution after comparing two options.'],
      ['Closing summary', 'Close a presentation with three key takeaways and a clear next step.'],
      ['Virtual presentation', 'Welcome an online audience and set expectations for a virtual presentation.'],
      ['Training session', 'Teach a beginner how to complete a simple process.'],
      ['Research presentation', 'Explain your research question, method, and finding.'],
      ['Boardroom update', 'Deliver a confident two-minute executive project update.'],
    ]),
  },
  {
    id: 'founder', title: 'Founder Pitch', description: 'Make your idea impossible to ignore.', accent: 'from-amber-400 to-orange-500',
    scenarios: createScenarios('founder', [
      ['30-second elevator pitch', 'Pitch your startup in 30 seconds: problem, solution, and who it serves.'],
      ['The problem', 'Explain a painful customer problem with a relatable real-world example.'],
      ['Your solution', 'Explain how your product solves the problem differently.'],
      ['Market opportunity', 'Explain the size and importance of your target market.'],
      ['Customer story', 'Tell a short story showing how a customer benefits from your product.'],
      ['Business model', 'Explain how your startup makes money in simple language.'],
      ['Competition', 'Describe competitors and your unique advantage without sounding defensive.'],
      ['Traction update', 'Present early traction using clear evidence and context.'],
      ['Founder story', 'Explain why you are the right person to build this company.'],
      ['Investor objection', 'Respond to: Why will customers pay for this?'],
      ['Funding ask', 'State how much you are raising and what the funds will achieve.'],
      ['Shark Tank pitch', 'Give a high-energy pitch to a panel of investors.'],
      ['Customer discovery', 'Interview a potential customer about their current problem.'],
      ['Pivot explanation', 'Explain why your startup changed direction and what you learned.'],
      ['Two-minute full pitch', 'Deliver a complete investor pitch with problem, solution, market, traction, and ask.'],
    ]),
  },
  {
    id: 'group-discussion', title: 'Group Discussion', description: 'Contribute clearly and build on ideas.', accent: 'from-emerald-400 to-teal-300',
    scenarios: createScenarios('group-discussion', [
      ['Start a discussion', 'Open a group discussion on whether AI helps students.'], ['Build on an idea', 'Respectfully build on a teammate’s point about remote work.'], ['Disagree politely', 'Disagree with a point while keeping the conversation constructive.'], ['Bring in a quiet member', 'Invite a quiet group member to share their view.'], ['Summarise viewpoints', 'Summarise two opposing views fairly.'], ['Timekeeper role', 'Help a group stay focused when time is running out.'], ['College attendance', 'Discuss whether college attendance should be compulsory.'], ['Social media debate', 'Discuss whether social media does more harm than good.'], ['Climate action', 'Argue for one practical climate action universities can take.'], ['Online vs offline learning', 'Present your position on online versus classroom learning.'], ['Team conflict', 'Help a team reach agreement after a disagreement.'], ['Prioritise options', 'Help choose the best of three project ideas.'], ['Evidence-based point', 'Make a strong point using an example or evidence.'], ['Counter argument', 'Challenge an argument with a clear counterpoint.'], ['Close the discussion', 'Conclude a group discussion with the best shared recommendation.'],
    ]),
  },
  {
    id: 'public-speaking', title: 'Public Speaking', description: 'Own the room, one sentence at a time.', accent: 'from-rose-500 to-pink-300',
    scenarios: createScenarios('public-speaking', [
      ['College introduction', 'Introduce yourself confidently to a new college class.'], ['Welcome speech', 'Welcome guests to a college event.'], ['Vote of thanks', 'Give a warm vote of thanks after an event.'], ['Motivational speech', 'Motivate classmates before an important exam.'], ['Festival speech', 'Give a short speech at a cultural celebration.'], ['Award acceptance', 'Accept an award with gratitude and confidence.'], ['Host an event', 'Open an event as the host and energise the room.'], ['Social cause speech', 'Speak about a social cause you care about.'], ['Story with a lesson', 'Tell a personal story with a clear lesson.'], ['Impromptu topic', 'Speak for one minute on: The power of small habits.'], ['Farewell speech', 'Give a meaningful farewell speech for classmates.'], ['Welcome new students', 'Welcome first-year students to campus.'], ['Persuade an audience', 'Persuade an audience to volunteer for a community project.'], ['Toast speech', 'Give a short, warm celebratory toast.'], ['Keynote opening', 'Open a keynote speech on the future of work.'],
    ]),
  },
  {
    id: 'networking', title: 'Networking', description: 'Start conversations that open doors.', accent: 'from-sky-400 to-indigo-400',
    scenarios: createScenarios('networking', [
      ['Meet a stranger', 'Start a natural conversation with someone at a professional event.'], ['Introduce your work', 'Explain what you do in a clear, friendly way.'], ['Ask for advice', 'Ask a senior professional for career advice.'], ['Follow-up after event', 'Record a warm follow-up message after meeting someone.'], ['Find common ground', 'Build rapport with a professional you just met.'], ['Request a referral', 'Respectfully ask for guidance about a referral.'], ['Coffee chat opening', 'Open a 15-minute coffee chat with a professional.'], ['College alumni chat', 'Introduce yourself to an alumnus and ask a thoughtful question.'], ['Conference conversation', 'Start a conversation after a conference session.'], ['Explain your interest', 'Explain why you are interested in someone’s industry.'], ['End gracefully', 'End a networking conversation politely while keeping the door open.'], ['LinkedIn voice note', 'Record a concise LinkedIn introduction voice note.'], ['Ask about their journey', 'Ask a professional about their career journey.'], ['Share your portfolio', 'Introduce your portfolio or project without overselling.'], ['Reconnect', 'Reconnect with a former colleague after a long time.'],
    ]),
  },
  {
    id: 'daily-conversation', title: 'Daily Conversation', description: 'Feel comfortable in everyday English.', accent: 'from-lime-400 to-green-500',
    scenarios: createScenarios('daily-conversation', [
      ['Order at a cafe', 'Order food politely and ask one follow-up question.'], ['Ask for directions', 'Ask a stranger for directions and confirm the route.'], ['Doctor appointment', 'Explain your symptoms clearly to a doctor.'], ['Talk to a teacher', 'Ask your teacher for help with an assignment.'], ['Roommate issue', 'Discuss a small issue with your roommate calmly.'], ['Phone call enquiry', 'Call a service provider to ask about an appointment.'], ['Return an item', 'Explain a problem while returning a product politely.'], ['Make a plan', 'Invite a friend and make a plan for the weekend.'], ['Introduce a friend', 'Introduce two friends who have not met before.'], ['Apologise professionally', 'Apologise for arriving late and explain briefly.'], ['Ask for clarification', 'Ask someone to repeat or explain something politely.'], ['Give instructions', 'Explain to a friend how to reach your home.'], ['Small talk', 'Make small talk with a person you meet in a lift.'], ['Share an opinion', 'Share your opinion on a recent movie or book.'], ['Handle a misunderstanding', 'Clear up a small misunderstanding with a friend.'],
    ]),
  },
  {
    id: 'sales', title: 'Sales Call', description: 'Listen, explain value, and close with care.', accent: 'from-orange-400 to-red-400',
    scenarios: createScenarios('sales', [
      ['Cold call opening', 'Open a cold call in a respectful, value-focused way.'], ['Discover needs', 'Ask questions to understand a customer’s need.'], ['Explain value', 'Explain how your product solves one customer problem.'], ['Handle price objection', 'Respond when a customer says the price is too high.'], ['Ask for the sale', 'Ask for the next step or close clearly without pressure.'], ['Product walkthrough', 'Give a concise product walkthrough to a prospect.'], ['Follow-up call', 'Follow up after a product demo.'], ['Compare competitors', 'Explain your advantage when a customer mentions a competitor.'], ['Upsell ethically', 'Suggest a useful upgrade based on a customer need.'], ['Customer success check-in', 'Check in with an existing customer and offer help.'], ['Handle rejection', 'Respond gracefully when a prospect says no.'], ['Renewal conversation', 'Discuss a subscription renewal with a customer.'], ['Qualify a lead', 'Ask three questions to see if a lead is a good fit.'], ['Present ROI', 'Explain the return on investment in simple terms.'], ['Executive pitch', 'Present your solution to a busy decision maker in 90 seconds.'],
    ]),
  },
  {
    id: 'debate', title: 'Debate Arena', description: 'Think on your feet and argue with respect.', accent: 'from-red-500 to-orange-300',
    scenarios: createScenarios('debate', [
      ['AI in education', 'Argue whether AI should be widely used in education.'], ['Four-day work week', 'Support or oppose a four-day work week.'], ['Social media age limit', 'Argue for or against an age limit for social media.'], ['Cashless society', 'Debate whether India should become fully cashless.'], ['Remote work', 'Debate whether remote work improves productivity.'], ['Space exploration', 'Defend investment in space exploration.'], ['College degrees', 'Debate whether a college degree is necessary for success.'], ['Electric vehicles', 'Argue whether electric vehicles should be subsidised.'], ['Uniforms in college', 'Support or oppose uniforms in college.'], ['Influencers', 'Debate whether influencers are positive role models.'], ['Exam system', 'Debate whether exams truly measure learning.'], ['Privacy vs safety', 'Balance online privacy and public safety.'], ['Startup funding', 'Argue whether founders should bootstrap before raising money.'], ['English in education', 'Debate the role of English in Indian education.'], ['Closing rebuttal', 'Give a concise closing rebuttal to an opposing argument.'],
    ]),
  },
  {
    id: 'storytelling', title: 'Storytelling', description: 'Make personal experiences stay with people.', accent: 'from-purple-500 to-violet-300',
    scenarios: createScenarios('storytelling', [
      ['A turning point', 'Tell a story about a moment that changed your thinking.'], ['A failure', 'Tell a story about a failure and what it taught you.'], ['A proud moment', 'Tell a story about a moment you felt proud.'], ['A difficult decision', 'Describe a difficult decision and how you made it.'], ['Team success', 'Tell a story about succeeding with a team.'], ['Unexpected kindness', 'Share a story about unexpected kindness.'], ['First day memory', 'Tell a vivid story about your first day in a new place.'], ['Travel mishap', 'Tell a light story about a travel mishap.'], ['Solve a problem', 'Tell a story about solving an unexpected problem.'], ['Inspiration', 'Tell a story about someone who inspired you.'], ['Learning a skill', 'Describe the journey of learning a difficult skill.'], ['A missed opportunity', 'Share a story about a missed opportunity and the lesson.'], ['A meaningful place', 'Describe a place that has special meaning to you.'], ['Your future story', 'Tell a story set five years in your future.'], ['One-minute story', 'Tell a complete story in one minute with a beginning, middle, and end.'],
    ]),
  },
]

export const allScenarios = scenarioTracks.flatMap((track) =>
  track.scenarios.map((scenario) => ({ ...scenario, trackId: track.id, trackTitle: track.title, accent: track.accent }))
)
