const PENDDING = "pendding";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    this.status = PENDDING;
    this.value = undefined;
    this.reason = undefined;

    this.onResolveCbs = [];
    this.onRejectCbs = [];

    const resolve = (value) => {
      if (this.status === PENDDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolveCbs.map((fn) => fn(value));
      }
    };
    const reject = (reason) => {
      if (this.status === PENDDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectCbs.map((fn) => fn(reason));
      }
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  then(onResolve, onReject) {
    if (this.status === FULFILLED) {
      onResolve(this.value);
    }
    if (this.status === REJECTED) {
      onReject(this.reason);
    }
    if (this.status === PENDDING) {
      this.onResolveCbs.push(onResolve);
      this.onRejectCbs.push(onReject);
    }
  }
}
new MyPromise((resolve, reject) => {
  setTimeout(() => {
    // resolve(666);
    reject(123);
  }, 2000);
}).then(
  (res) => {
    console.log("res===", res);
  },
  (err) => {
    console.log("err===", err);
  }
);
