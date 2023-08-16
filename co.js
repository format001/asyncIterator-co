
// 异步迭代函数
function co (generator) {
    var ctx = this,
        args = [].slice.call(arguments, 1),
        iterator;

    //每次迭代的时候，最终返回一个Promise
    return new Promise((resolve, reject) => {
        if (typeof generator === 'function') iterator = generator.apply(ctx, args);
        if (!iterator || typeof iterator.next !== 'function') return resolve(iterator);

        // 迭代器递归函数 参数传给next的数据
        function walk (data) {
            // 执行next -> value done 对象
            const {value, done} = iterator.next(data);
            // 如果 done === false
            if (!done) {
                // value -> then -> 拿到新的迭代是 程序执行的结果
                Promise.resolve(value)
                    .then((res) => {
                        //继续执行迭代器递归函数
                        walk(res);
                        // Promise出错了 -> 本次返回的Promise的reject
                    }, (err) => {
                        var ret;
                        try {
                            ret = iterator.throw(err);
                        } catch (e) {
                            return reject(e);
                        }
                        walk(ret);
                    });
            } else {
                // done === true 迭代结束 成功抛除value
                resolve(value);
            }
        }
        walk();
    });
}


function asyncOperation(value) {
    return new Promise((resolve, reject) => {
        // setTimeout(() => {
        if (value > 4) {
            reject(value * 2);
        } else {
            resolve(value * 2);
        }
        // }, 1000);
    });
}

// 使用 co 处理异步流程
co(function* () {
    try {
        const result1 = yield asyncOperation(2);
        console.log(result1); // 输出: 4

        const result2 = yield asyncOperation(3);
        console.log(result2); // 输出: 8

        // ... 可以继续添加更多异步操作
    } catch (error) {
        console.error(error);
    }
});







/*
* CO 源码
*   github：  https://github.com/tj/co/tree/master
* */

/**
 * slice() reference.
 */

// var slice = Array.prototype.slice;
//
// /**
//  * Expose `co`.
//  */
//
// module.exports = co['default'] = co.co = co;
//
// /**
//  * Wrap the given generator `fn` into a
//  * function that returns a promise.
//  * This is a separate function so that
//  * every `co()` call doesn't create a new,
//  * unnecessary closure.
//  *
//  * @param {GeneratorFunction} fn
//  * @return {Function}
//  * @api public
//  */
//
// co.wrap = function (fn) {
//     createPromise.__generatorFunction__ = fn;
//     return createPromise;
//     function createPromise() {
//         return co.call(this, fn.apply(this, arguments));
//     }
// };
//
// /**
//  * Execute the generator function or a generator
//  * and return a promise.
//  *
//  * @param {Function} fn
//  * @return {Promise}
//  * @api public
//  */
//
// function co(gen) {
//     var ctx = this;
//     var args = slice.call(arguments, 1);
//
//     // we wrap everything in a promise to avoid promise chaining,
//     // which leads to memory leak errors.
//     // see https://github.com/tj/co/issues/180
//     return new Promise(function(resolve, reject) {
//         if (typeof gen === 'function') gen = gen.apply(ctx, args);
//         if (!gen || typeof gen.next !== 'function') return resolve(gen);
//
//         onFulfilled();
//
//         /**
//          * @param {Mixed} res
//          * @return {Promise}
//          * @api private
//          */
//
//         function onFulfilled(res) {
//             var ret;
//             try {
//                 ret = gen.next(res);
//             } catch (e) {
//                 return reject(e);
//             }
//             next(ret);
//             return null;
//         }
//
//         /**
//          * @param {Error} err
//          * @return {Promise}
//          * @api private
//          */
//
//         function onRejected(err) {
//             var ret;
//             try {
//                 ret = gen.throw(err);
//             } catch (e) {
//                 return reject(e);
//             }
//             next(ret);
//         }
//
//         /**
//          * Get the next value in the generator,
//          * return a promise.
//          *
//          * @param {Object} ret
//          * @return {Promise}
//          * @api private
//          */
//
//         function next(ret) {
//             if (ret.done) return resolve(ret.value);
//             var value = toPromise.call(ctx, ret.value);
//             if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
//             return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
//                 + 'but the following object was passed: "' + String(ret.value) + '"'));
//         }
//     });
// }
//
// /**
//  * Convert a `yield`ed value into a promise.
//  *
//  * @param {Mixed} obj
//  * @return {Promise}
//  * @api private
//  */
//
// function toPromise(obj) {
//     if (!obj) return obj;
//     if (isPromise(obj)) return obj;
//     if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
//     if ('function' == typeof obj) return thunkToPromise.call(this, obj);
//     if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
//     if (isObject(obj)) return objectToPromise.call(this, obj);
//     return obj;
// }
//
// /**
//  * Convert a thunk to a promise.
//  *
//  * @param {Function}
//  * @return {Promise}
//  * @api private
//  */
//
// function thunkToPromise(fn) {
//     var ctx = this;
//     return new Promise(function (resolve, reject) {
//         fn.call(ctx, function (err, res) {
//             if (err) return reject(err);
//             if (arguments.length > 2) res = slice.call(arguments, 1);
//             resolve(res);
//         });
//     });
// }
//
// /**
//  * Convert an array of "yieldables" to a promise.
//  * Uses `Promise.all()` internally.
//  *
//  * @param {Array} obj
//  * @return {Promise}
//  * @api private
//  */
//
// function arrayToPromise(obj) {
//     return Promise.all(obj.map(toPromise, this));
// }
//
// /**
//  * Convert an object of "yieldables" to a promise.
//  * Uses `Promise.all()` internally.
//  *
//  * @param {Object} obj
//  * @return {Promise}
//  * @api private
//  */
//
// function objectToPromise(obj){
//     var results = new obj.constructor();
//     var keys = Object.keys(obj);
//     var promises = [];
//     for (var i = 0; i < keys.length; i++) {
//         var key = keys[i];
//         var promise = toPromise.call(this, obj[key]);
//         if (promise && isPromise(promise)) defer(promise, key);
//         else results[key] = obj[key];
//     }
//     return Promise.all(promises).then(function () {
//         return results;
//     });
//
//     function defer(promise, key) {
//         // predefine the key in the result
//         results[key] = undefined;
//         promises.push(promise.then(function (res) {
//             results[key] = res;
//         }));
//     }
// }
//
// /**
//  * Check if `obj` is a promise.
//  *
//  * @param {Object} obj
//  * @return {Boolean}
//  * @api private
//  */
//
// function isPromise(obj) {
//     return 'function' == typeof obj.then;
// }
//
// /**
//  * Check if `obj` is a generator.
//  *
//  * @param {Mixed} obj
//  * @return {Boolean}
//  * @api private
//  */
//
// function isGenerator(obj) {
//     return 'function' == typeof obj.next && 'function' == typeof obj.throw;
// }
//
// /**
//  * Check if `obj` is a generator function.
//  *
//  * @param {Mixed} obj
//  * @return {Boolean}
//  * @api private
//  */
//
// function isGeneratorFunction(obj) {
//     var constructor = obj.constructor;
//     if (!constructor) return false;
//     if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
//     return isGenerator(constructor.prototype);
// }
//
// /**
//  * Check for plain object.
//  *
//  * @param {Mixed} val
//  * @return {Boolean}
//  * @api private
//  */
//
// function isObject(val) {
//     return Object == val.constructor;
// }
