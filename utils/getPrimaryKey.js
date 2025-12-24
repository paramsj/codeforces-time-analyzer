function getPrimaryKey(problem) {
    if(problem.contestId && problem.index) {
        return `${problem.contestId}${problem.index}`;
    }
    if(problem.problemsetName && problem.index) {
        return `${problem.problemsetName}${problem.index}`;
    }
    return `${problem.name}${problem.index}`;
}

export {getPrimaryKey};