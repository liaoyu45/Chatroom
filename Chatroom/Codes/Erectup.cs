using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(Chatroom.Erectup))]

namespace Chatroom {
    public class Erectup {
        public void Configuration(IAppBuilder app) {
            app.MapSignalR();
        }
    }
}
