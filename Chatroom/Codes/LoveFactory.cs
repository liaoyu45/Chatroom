using System;
using System.Data.Entity;
using System.IO;

namespace Chatroom {
    public class LoveFactory : DbContext {

        public LoveFactory()
            : base("LoveFactory") {
        }
        public DbSet<Man> Men { get; set; }
        public DbSet<Friend> Friends { get; set; }
        public static void Dispose(Action<LoveFactory> a) {
            using (var f = new LoveFactory()) {
                a(f);
            }
        }
        public static object Using(Func<LoveFactory, object> a) {
            using (var f = new LoveFactory()) {
                try {
                    return a(f);
                } catch (Exception e) {
                    using (var file = File.AppendText("/DB_error_log.txt")) {
                        file.WriteLine(e.Message);
                        file.WriteLine(getInner(e));
                        file.Flush();
                    }
                    throw new Exception("innerError");
                }
            }
        }
        static string getInner(Exception e) {
            return e.InnerException == null ? e.Message : getInner(e.InnerException);
        }
    }
    public static class Disposable {
        public static T Dispose<D, T>(this D disposable, Func<D, T> func) where D : class, IDisposable, new() {
            disposable = disposable ?? new D();
            using (disposable) {
                return func(disposable);
            }
        }
    }
}
