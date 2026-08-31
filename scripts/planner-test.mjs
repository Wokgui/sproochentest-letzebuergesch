import assert from 'node:assert/strict';
import { storyCapForGoal, dailySessionBlueprint, upcomingReviewItems } from '../src/planner.js';
assert.equal(storyCapForGoal(5),4);assert.equal(storyCapForGoal(10),5);assert.equal(storyCapForGoal(15),6);assert.equal(storyCapForGoal(20),8);
for(const goal of [5,10,15,20]){const p=dailySessionBlueprint({goal,storyMinutes:storyCapForGoal(goal),dueCount:9,mistakeCount:2,upcomingCount:3});assert.ok(p.total<=goal);assert.equal(p.tasks[0].id,'story');}
assert.deepEqual(dailySessionBlueprint({goal:5,storyMinutes:4,dueCount:4}).tasks.map(x=>x.id),['story']);
assert.ok(dailySessionBlueprint({goal:10,storyMinutes:5,dueCount:3}).tasks.some(x=>x.id==='quick'));
assert.ok(dailySessionBlueprint({goal:15,storyMinutes:6,dueCount:3}).tasks.some(x=>x.id==='sprooch'));
assert.ok(dailySessionBlueprint({goal:20,storyMinutes:7,dueCount:4,mistakeCount:2}).tasks.some(x=>x.id==='mistakes'));
const now=1000000,items=[{kind:'word',item:{id:'due',nextReview:now-1,difficulty:8}},{kind:'word',item:{id:'soon-weak',nextReview:now+1000,difficulty:7,successCount:1}},{kind:'word',item:{id:'soon-stable',nextReview:now+2000,difficulty:4,successCount:5}},{kind:'phrase',item:{id:'later',nextReview:now+4*86400000,difficulty:9}}];
const up=upcomingReviewItems(items,{now,horizonDays:3});assert.deepEqual(up.map(x=>x.item.id),['soon-weak']);assert.equal(up[0].item.nextReview,now+1000);console.log('Planner test OK');
