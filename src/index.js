const { exec, execSync } = require('child_process');
const { PerformanceObserver, performance } = require('perf_hooks');

const fs = require('fs-extra');

if(process.argv.length != 3){
    console.log('Usage: sudoku-tester <solver binary location>');
    process.exit();
}

function main(){
    let puzzles = [];

    let puzzleFiles = fs.readdirSync(__dirname + '/../puzzles');
    for(let i = 0; i < puzzleFiles.length; i++){
        console.log(puzzleFiles[i]);
        let p = fs.readFileSync(`${__dirname}/../puzzles/${puzzleFiles[i]}`, {encoding: 'UTF-8'});
        p = JSON.parse(p.trim());
        p.name = puzzleFiles[i];
        p.solvedVectorString = Array.prototype.concat.apply([], p.solved);
        p.solvedVectorString = p.solvedVectorString.join(' ');
    
        p.unsolvedVectorString = [];
        for(let row = 0; row < p.solved.length; row++){
            let r = [];
            for(let col = 0; col < p.solved[row].length; col++){
                let val = p.solved[row][col];
                if(p.unsolved[row].includes(val)){
                    r.push(val);
                }else{
                    r.push('?');
                }
            }
            p.unsolvedVectorString.push(r);
        }
    
        p.unsolvedVectorString = Array.prototype.concat.apply([], p.unsolvedVectorString);
        p.unsolvedVectorString = p.unsolvedVectorString.join(' ');
    
        puzzles.push(p);
    }
    
    let executable = process.argv[2];
    
    for(let i = 0; i < puzzles.length; i++){
        let p = puzzles[i];

        let execution = () => {
            let start = performance.now();
            try{
                let cmd = `"${executable}" 81 ${p.unsolvedVectorString}`;
                console.log(`Running command: ${cmd}`);
                let stdout = execSync(cmd, {encoding: 'UTF-8'});

                let end = performance.now();
                if(stdout.trim() !== p.solvedVectorString.trim()){
                    console.log(`Failed to solve ${p.name}`);
                    console.log(`Expected: "${p.solvedVectorString}"`);
                    console.log(`Received: "${stdout}"`);
                }else{
                    let elapsed = end - start;
                    console.log(`Solved puzzle ${p.name} in ${elapsed}ms`);
                }

            }catch(err){
                console.log(`Received error while solving ${p.name}`);
                console.log(err);
            }
        }

        execution();

    }
}

main();
