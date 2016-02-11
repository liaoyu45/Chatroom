using System;

namespace CodeHub {
    public static class NoInstances<TExecutor> {
        public static Func<TResult> Ex<TResult>(Func<TExecutor> instance, Func<TExecutor, Func<TResult>> method) {
            return method(instance());
        }
        public static Func<TParameter0, TResult> Ex<TParameter0, TResult>(Func<TExecutor> instance, Func<TExecutor, Func<TParameter0, TResult>> method) {
            return method(instance());
        }
        public static Func<TParameter0, TParameter1, TResult> Ex<TParameter0, TParameter1, TResult>(Func<TExecutor> instance, Func<TExecutor, Func<TParameter0, TParameter1, TResult>> method) {
            return method(instance());
        }
    }
    class Test {
        void go() {
            NoInstances<DateTime>.Ex<TimeSpan, DateTime>(() => DateTime.Now, d => d.Add)(new TimeSpan());
            // NoInstances<DateTime>.Ex(() => DateTime.Now, d => d.Add);
        }
    }
}
