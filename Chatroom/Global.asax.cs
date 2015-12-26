using System;
using System.Web;

namespace Chatroom {
    public class Global : System.Web.HttpApplication {

        public static bool published { get; set; }
        protected void Application_Start(object sender, EventArgs e) {
        }

        protected void Session_Start(object sender, EventArgs e) {

        }

        protected void Application_BeginRequest(object sender, EventArgs e) {
            published = HttpContext.Current.Request.Url.Host.IndexOf("localhost") > 0;
        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e) {

        }

        protected void Application_Error(object sender, EventArgs e) {

        }

        protected void Session_End(object sender, EventArgs e) {

        }

        protected void Application_End(object sender, EventArgs e) {

        }
    }
}