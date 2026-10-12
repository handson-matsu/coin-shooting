// Legacy experiments have no status; their state is derived without rewriting data.
export function canContinue(experiment){return Boolean(experiment)&&!['aborted','completed'].includes(experiment.status)&&experiment.shots.length<experiment.count;}
export function stateLabel(experiment){return experiment.status==='aborted'?'途中終了':experiment.status==='completed'||experiment.shots.length>=experiment.count?'完了':'途中';}
export function abortedRecord(experiment,endedAt){return {...experiment,status:'aborted',actualCount:experiment.shots.length,endedAt};}
