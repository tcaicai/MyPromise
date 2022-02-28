/**
 * 如何控制promise的并发数量
 */
class Scheduler {
  list = [];
  maxNum = 2;
  workingNum = 0;

  add(promiseCreator) {
    this.list.push(promiseCreator);
  }

  start() {
    for (let i = 0; i < this.maxNum; i++) {
      this.doNext();
    }
  }

  doNext() {
    if (this.list.length && this.workingNum < this.maxNum) {
      this.workingNum++;
      this.list
        .shift()()
        .then(() => {
          this.workingNum--;
          this.doNext();
        });
    }
  }
}

const timeout = (time) => new Promise((resolve) => setTimeout(resolve, time));

const scheduler = new Scheduler();

const addTask = (time, order) => {
  scheduler.add(() => timeout(time).then(() => console.log(order)));
};
addTask(1000, 1);
addTask(500, 2);
addTask(300, 3);
addTask(400, 4);

scheduler.start();
