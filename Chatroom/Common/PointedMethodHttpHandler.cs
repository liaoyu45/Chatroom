using Newtonsoft.Json;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.SessionState;

namespace Chatroom {
    public abstract class PointedMethodHttpHandler : IHttpHandler, IRequiresSessionState {
        public PointedMethodHttpHandler() {
            methods = new Lazy<MethodInfo[]>(() => this.GetType().GetMethods());
        }
        public bool IsReusable {
            get { return false; }
        }

        static Lazy<MethodInfo[]> methods;
        protected virtual string ServerMethod {
            get { return "serverMethod"; }
        }
        public void ProcessRequest(HttpContext context) {
            var methodName = this.GetString(ServerMethod, @"\b[a-zA-Z][a-zA-Z0-9]+\b");
            var method = methods.Value.FirstOrDefault(m => m.Name.ToLower() == methodName.ToLower());
            if (method == null) {
                throw this.RecordError("if (method == null)");
            }
            object result;
            try {
                result = method.Invoke(this, null);
            } catch (Exception e) {
                throw this.RecordError(e.GetInnerMessage());
            }
            HttpContext.Current.Response.ContentType = "application/json";
            HttpContext.Current.Response.Write(JsonConvert.SerializeObject(result));
        }
        protected bool GetString(string key, string patten, out string value) {
            value = HttpContext.Current.Request[key];
            return Regex.IsMatch((value ?? string.Empty).Trim(), patten);
        }
        protected string GetString(string key) {
            return (HttpContext.Current.Request[key] ?? string.Empty).Trim();
        }
        protected string GetString(string key, bool required) {
            var result = (HttpContext.Current.Request[key] ?? string.Empty).Trim();
            if (result.Length == 0 && required) throw this.RecordError("key: {0} is required.", key);
            return result;
        }
        /// <summary>
        /// return a required value. pass patten as null or \"\" if the value is only required.
        /// </summary>
        protected string GetString(string key, string patten) {
            var value = HttpContext.Current.Request[key];
            if ((value ?? string.Empty).Trim().Length == 0 || ((patten ?? string.Empty).Length > 0 && !Regex.IsMatch(value, patten)))
                throw this.RecordError("key: {0} is required or doesn't match the patten: {1}.", key, patten);
            return value.Trim();
        }
        /// <summary>
        /// return an integer. return int.MinValue if failed.
        /// </summary>
        protected int GetInt(string key) {
            var value = HttpContext.Current.Request[key];
            if (value == null) return int.MinValue;
            int result;
            if (int.TryParse(value, out result)) {
                return result;
            }
            return int.MinValue;
        }
        protected bool GetInt(string key, out int result) {
            var value = HttpContext.Current.Request[key];
            return int.TryParse(value, out result);
        }
        protected bool GetInt(string key, int min, int max, out int result) {
            var value = HttpContext.Current.Request[key];
            var ok = int.TryParse(value, out result);
            result = Math.Max(min, Math.Min(max, result));
            return ok;
        }
        protected virtual Exception RecordError(string format, params object[] errors) {
            var request = HttpContext.Current.Request;
            var f = File.AppendText(request.MapPath("error-log.txt"));
            f.WriteLine("-------------{0}:{1}", DateTime.Now, request.Path);
            var all = request.Params;
            foreach (var key in all.AllKeys)
                f.WriteLine("key:{0}\n\tvalue:{1}", key, all[key]);
            var errorsText = string.Format(format, errors);
            f.WriteLine(errorsText);
            f.Write("--------------------------------------");
            f.Flush();
            f.Close();
            return new Exception(errorsText);
        }
    }
    public static class ExceptionExtensoin {
        public static string GetInnerMessage(this Exception e) {
            return e == null ? string.Empty : e.InnerException == null ? e.Message : e.InnerException.GetInnerMessage();
        }
    }
}