export class Scheduler {

    constructor() {
        this.queue = [];
    }

    addTask(task) {
        if(task instanceof Task) {
            this.queue.push(task);
        }
    }

    removeTask(task) {
        const index = this.queue.indexOf(task);
        if(index != -1) {
            this.queue.splice(index, 1);
        }
    }

    requestTask() {
        if(this.queue.length > 0) {
            const task = this.queue[0];
            return task;
        }
        return null;
    }

    run(deltaTime) {
        for(let task of this.queue) {
            const done = task.execute(deltaTime);
            if(done) this.removeTask(task);
        }
    }
}

export class Task {

    constructor() {
        
    }

    execute(ms) {
        return true;
    }

}
