using System;
using System.Data.Entity;
using System.IO;

namespace Chatroom {
    public class LoveFactory : DbContext {
        public LoveFactory()
            : base("LoveFactory") {
        }
        public DbSet<Man> Men { get; set; }
        public DbSet<ManInfo> ManInfos { get; set; }

        public static void Using(Action<LoveFactory> a) {
            using (var f = new LoveFactory()) {
                try {
                    a(f);
                } catch (Exception e) {
                    log(e);
                    throw;
                }
            }
        }
        public static T Using<T>(Func<LoveFactory, T> a) {
            using (var f = new LoveFactory()) {
                try {
                    return a(f);
                } catch (Exception e) {
                    log(e);
                    throw;
                }
            }
        }

        private static void log(Exception e) {
            using (var file = File.AppendText("/DB_error_log.txt")) {
                file.WriteLine(e.Message);
                file.WriteLine(getInner(e));
                file.Flush();
            }
        }

        static string getInner(Exception e) {
            return e.InnerException == null ? e.Message : getInner(e.InnerException);
        }
    }
}