export const DAILY_GOALS = [5,10,15,20];

export function storyCapForGoal(goal){
  goal=DAILY_GOALS.includes(Number(goal))?Number(goal):10;
  if(goal<=5)return 4;
  if(goal<=10)return 5;
  if(goal<=15)return 6;
  return 8;
}

export function dailySessionBlueprint({goal=10,storyMinutes=4,dueCount=0,mistakeCount=0,upcomingCount=0}={}){
  goal=DAILY_GOALS.includes(Number(goal))?Number(goal):10;
  storyMinutes=Math.max(1,Math.min(Number(storyMinutes)||4,goal));
  const tasks=[{id:'story',minutes:storyMinutes}], remaining=()=>goal-tasks.reduce((n,x)=>n+x.minutes,0);
  const add=(id,minutes)=>{if(minutes<=remaining())tasks.push({id,minutes});};
  if(dueCount>0){const minutes=dueCount>=8?4:dueCount>=3?3:2;add('review',minutes);}
  if(goal>=10)add(goal<=10?'quick':'sprooch',goal<=10?2:5);
  if(mistakeCount>0)add('mistakes',3);
  if(dueCount===0&&upcomingCount>0)add('upcoming',2);
  if(goal>=20&&remaining()>=3)add('challenge',3);
  return {goal,tasks,total:tasks.reduce((n,x)=>n+x.minutes,0),remaining:remaining()};
}

export function upcomingReviewItems(items,{now=Date.now(),horizonDays=3,limit=20}={}){
  const horizon=now+Math.max(1,Number(horizonDays)||3)*86400000;
  return (Array.isArray(items)?items:[]).filter(x=>x?.item&&Number(x.item.nextReview)>now&&Number(x.item.nextReview)<=horizon).map(x=>{const i=x.item;const weakness=(i.manualFragile?5:0)+(i.fromMistake?5:0)+Math.min(4,Number(i.lapses)||0)+(Number(i.difficulty||5)>=6?2:0)+(Number(i.successCount||0)<3?1:0);return {...x,weakness};}).filter(x=>x.weakness>0).sort((a,b)=>b.weakness-a.weakness||Number(a.item.nextReview)-Number(b.item.nextReview)).slice(0,Math.max(1,Number(limit)||20));
}
