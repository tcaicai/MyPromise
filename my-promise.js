const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
const isFunction = (fn) => typeof fn === 'function';
const isObject = (obj) => typeof obj === 'object';
const resolvePromise = (promise, resolveRes, resolve, reject) => {
  if (promise === resolveRes) {
    return reject(new TypeError('The promise and the return value are the same'));
  }

  let called;
  if (resolveRes !== null && (isObject(resolveRes) || isFunction(resolveRes))) {
    try {
      const then = resolveRes.then;
      if (isFunction(then)) {
        then.call(
          resolveRes,
          (value) => {
            if (called) return;
            called = true;
            resolvePromise(promise, value, resolve, reject);
          },
          (reason) => {
            if (called) return;
            called = true;
            reject(reason);
          }
        );
      } else {
        if (called) return;
        called = true;
        resolve(resolveRes);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e);
    }
  } else {
    resolve(resolveRes);
  }
};

export default class MyPromise {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function`);
    }

    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;

    this.onResolveCbs = [];
    this.onRejectCbs = [];

    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onResolveCbs.map((fn) => fn(value));
      }
    };
    const reject = (reason) => {
      if (this.status === PENDING) {
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
    // 入参为空的情况
    onResolve = isFunction(onResolve) ? onResolve : (value) => value;
    onReject = isFunction(onReject)
      ? onReject
      : (err) => {
          throw err;
        };
    // 链式调用
    const promise2 = new MyPromise((resolve, reject) => {
      const resolveMicroTask = () => {
        queueMicrotask(() => {
          try {
            const resolveRes = onResolve(this.value);
            resolvePromise(promise2, resolveRes, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };
      const rejectMicroTask = () => {
        queueMicrotask(() => {
          try {
            const rejectRes = onReject(this.reason);
            resolvePromise(promise2, rejectRes, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };

      if (this.status === FULFILLED) {
        resolveMicroTask();
      }
      if (this.status === REJECTED) {
        rejectMicroTask();
      }
      if (this.status === PENDING) {
        this.onResolveCbs.push(resolveMicroTask);
        this.onRejectCbs.push(rejectMicroTask);
      }
    });
    return promise2;
  }
  catch(onReject) {
    return this.then(null, onReject);
  }

  finally(callback) {
    return this.then(
      (value) => MyPromise.resolve(callback()).then(() => value),
      (err) => {
        MyPromise.resolve(callback()).then(() => {
          throw err;
        });
      }
    );
  }

  static resolve(param) {
    if (param instanceof MyPromise) {
      return param;
    }
    return new MyPromise((resolve) => {
      resolve(param);
    });
  }
  static reject(reason) {
    return new MyPromise((resolve, reject) => {
      reject(reason);
    });
  }

  static all(list) {
    return new MyPromise((resolve, reject) => {
      let values = [],
        count = 0;
      for (let [index, promise] of list.entries()) {
        promise.then(
          (res) => {
            console.log('index', index);
            values[index] = res;
            count++;
            count === list.length && resolve(values);
          },
          (err) => reject(err)
        );
      }
    });
  }
  static race(list) {
    return new MyPromise((resolve, reject) => {
      for (let [, promise] of list.entries()) {
        promise.then(
          (res) => {
            resolve(res);
          },
          (err) => reject(err)
        );
      }
    });
  }
}
// MyPromise.deferred = function () {
//   var result = {};
//   result.promise = new MyPromise(function (resolve, reject) {
//     result.resolve = resolve;
//     result.reject = reject;
//   });

//   return result;
// };
// module.exports = MyPromise;
