const PENDDING = "pendding";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    this.status = PENDDING;
    this.value = undefined;
    this.reason = undefined;

    const resolve = (value) => {
      if (this.status === PENDDING) {
        this.status = FULFILLED;
        this.value = value;
      }
    };
    const reject = (reason) => {
      if (this.status === PENDDING) {
        this.status = REJECTED;
        this.reason = reason;
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
  }
}
new MyPromise((resolve, reject) => {
  resolve(666);
}).then(
  (res) => {
    console.log("res===", res);
  },
  (err) => {
    console.log("err===", err);
  }
);
